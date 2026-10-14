import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { join } from "node:path";
import exifr from "exifr";
import sharp from "sharp";

const ROOT = new URL("../../", import.meta.url).pathname;
const ORIGINALS = join(ROOT, "photos/originals");
const CACHE = join(ROOT, "photos/.cache");
const PUBLIC = join(ROOT, "public/photos");
const MANIFEST = join(ROOT, "src/data/photos.json");
const REPORT = join(ROOT, "photos/report.json");

export const WIDTHS = [480, 1080, 1920];
const AVIF = { quality: 52, effort: 4, chromaSubsampling: "4:2:0" };
const LIMIT = Number(process.env.LIMIT ?? Infinity);
const CONCURRENCY = Number(process.env.CONCURRENCY ?? Math.max(2, availableParallelism() - 2));

sharp.concurrency(1);

const idFor = (driveId) => createHash("sha1").update(driveId).digest("hex").slice(0, 10);

const round = (n, d = 2) => (n == null || Number.isNaN(n) ? undefined : Math.round(n * 10 ** d) / 10 ** d);

function shutter(t) {
  if (!t) return undefined;
  return t >= 1 ? `${round(t, 1)}s` : `1/${Math.round(1 / t)}`;
}

function ev100(f, t, iso) {
  if (!f || !t || !iso) return undefined;
  return round(Math.log2((f * f) / t) - Math.log2(iso / 100), 1);
}

async function dHash(img) {
  const { data } = await img.clone().greyscale().resize(9, 8, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  let bits = "";
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += data[y * 9 + x] > data[y * 9 + x + 1] ? "1" : "0";
  return BigInt("0b" + bits).toString(16).padStart(16, "0");
}

const hamming = (a, b) => {
  let x = BigInt("0x" + a) ^ BigInt("0x" + b);
  let n = 0;
  while (x) {
    n += Number(x & 1n);
    x >>= 1n;
  }
  return n;
};

/** Salient centre as fractions of width and height, so crops keep the subject (Sharp's attention strategy). */
async function focusOf(img) {
  const small = await img.clone().resize(600, 600, { fit: "inside" }).toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = small.info;
  const tall = await sharp(small.data).resize(Math.round(w / 3), h, { fit: "cover", position: "attention" }).toBuffer({ resolveWithObject: true });
  const wide = await sharp(small.data).resize(w, Math.round(h / 3), { fit: "cover", position: "attention" }).toBuffer({ resolveWithObject: true });
  return [round(tall.info.attentionX / w, 2), round(wide.info.attentionY / h, 2)];
}

async function analyse(file) {
  const cachePath = join(CACHE, `${file.sha256}.json`);
  if (existsSync(cachePath)) {
    const cached = JSON.parse(await readFile(cachePath, "utf8"));
    if (cached.focus) return cached;
    const img = sharp(await readFile(join(ORIGINALS, file.local)), { failOn: "none" }).rotate();
    cached.focus = await focusOf(img);
    await writeFile(cachePath, JSON.stringify(cached));
    return cached;
  }

  const buf = await readFile(join(ORIGINALS, file.local));
  const img = sharp(buf, { failOn: "none" }).rotate();
  const { width, height } = await img.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info);

  const tags = await exifr
    .parse(buf, { tiff: true, exif: true, gps: false, xmp: false, icc: false, iptc: false, translateValues: true, reviveValues: false })
    .catch(() => ({}));
  const t = tags ?? {};
  const taken = t.DateTimeOriginal ?? t.CreateDate;
  const exif = {
    make: t.Make?.trim(),
    model: t.Model?.trim(),
    lens: (t.LensModel ?? t.LensInfo)?.toString().trim(),
    focal: round(t.FocalLength, 0),
    aperture: round(t.FNumber, 1),
    shutter: shutter(t.ExposureTime),
    iso: t.ISO,
    taken: typeof taken === "string" && /^\d{4}:\d\d:\d\d \d\d:\d\d/.test(taken)
      ? taken.slice(0, 19).replace(/^(\d{4}):(\d\d):(\d\d) /, "$1-$2-$3T")
      : undefined,
    software: t.Software?.trim(),
  };

  const small = img.clone().resize(64, 64, { fit: "inside" }).removeAlpha();
  const stats = await small.clone().stats();
  const [r, g, b] = stats.channels.map((c) => c.mean / 255);
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luma = round(0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b), 4);
  const hex = (n) => Math.round(n * 255).toString(16).padStart(2, "0");

  const lqip = await img.clone().resize(24, 24, { fit: "inside" }).webp({ quality: 40 }).toBuffer();

  const result = {
    width,
    height,
    exif,
    ev: ev100(t.FNumber, t.ExposureTime, t.ISO),
    luma,
    color: `#${hex(r)}${hex(g)}${hex(b)}`,
    lqip: `data:image/webp;base64,${lqip.toString("base64")}`,
    dhash: await dHash(img),
    focus: await focusOf(img),
  };
  await mkdir(CACHE, { recursive: true });
  await writeFile(cachePath, JSON.stringify(result));
  return result;
}

/** Variant files are named by the content hash of their original, so a re-edited photo gets new URLs. */
const fileKey = (file) => file.sha256.slice(0, 12);

async function variants(file, meta) {
  const key = fileKey(file);
  const missing = WIDTHS.filter((w) => !existsSync(join(PUBLIC, `${key}-${w}.avif`)));
  if (!missing.length) return;
  const buf = await readFile(join(ORIGINALS, file.local));
  for (const w of missing) {
    const target = Math.min(w, meta.width);
    await sharp(buf, { failOn: "none" })
      .rotate()
      .resize({ width: target, withoutEnlargement: true })
      .withIccProfile("srgb")
      .avif(AVIF)
      .toFile(join(PUBLIC, `.${key}-${w}.avif.tmp`));
    // Rename is atomic, so a server never hands out a half-written variant during a rebuild.
    await rename(join(PUBLIC, `.${key}-${w}.avif.tmp`), join(PUBLIC, `${key}-${w}.avif`));
  }
}

async function pool(items, fn) {
  const queue = items.map((item, i) => [item, i]);
  let done = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const [item, i] = queue.shift();
        await fn(item, i);
        if (++done % 100 === 0) console.log(`  ${done}/${items.length}`);
      }
    }),
  );
}

const inventory = JSON.parse(await readFile(process.env.INVENTORY ?? join(ROOT, "photos/inventory.json"), "utf8"));
const curation = JSON.parse(await readFile(join(ROOT, "src/data/curation.json"), "utf8"));
const present = [];
const missing = [];
for (const f of inventory.files.slice(0, LIMIT)) {
  if (f.sha256 && existsSync(join(ORIGINALS, f.local))) present.push(f);
  else missing.push(f.local);
}

console.log(`analysing ${present.length} originals (${missing.length} missing locally)`);
const analysed = new Map();
const unreadable = [];
await pool(present, async (f) => {
  try {
    analysed.set(f.driveId, await analyse(f));
  } catch (err) {
    unreadable.push({ local: f.local, error: String(err.message ?? err) });
  }
});

const firstBySha = new Map();
const duplicates = [];
const kept = [];
for (const f of present) {
  const meta = analysed.get(f.driveId);
  if (!meta) continue;
  const prior = firstBySha.get(f.sha256);
  if (prior) {
    duplicates.push({ kept: prior.local, duplicate: f.local, kind: "identical file" });
    continue;
  }
  firstBySha.set(f.sha256, f);
  kept.push(f);
}

const folderKey = (f) => [f.source, ...f.folder].join("/");
const collectionOf = new Map();
for (const c of curation.collections) for (const folder of c.folders) collectionOf.set(folder, c);

const photos = [];
const unassigned = new Set();
for (const f of kept) {
  const meta = analysed.get(f.driveId);
  const collection = collectionOf.get(folderKey(f));
  if (!collection) {
    unassigned.add(folderKey(f));
    continue;
  }
  const id = idFor(f.driveId);
  const override = curation.photos?.[id] ?? {};
  photos.push({
    id,
    file: fileKey(f),
    name: f.name,
    source: f.source,
    folder: f.folder,
    collection: collection.slug,
    width: meta.width,
    height: meta.height,
    orientation: meta.width > meta.height * 1.05 ? "landscape" : meta.height > meta.width * 1.05 ? "portrait" : "square",
    ev: meta.ev ?? null,
    luma: meta.luma,
    color: meta.color,
    focus: meta.focus,
    lqip: meta.lqip,
    exif: Object.fromEntries(Object.entries(meta.exif).filter(([, v]) => v != null && v !== "")),
    dhash: meta.dhash,
    ...override,
  });
}

const groups = new Map();
for (const p of photos) groups.set(p.collection, [...(groups.get(p.collection) ?? []), p]);
const nearDuplicates = [];
for (const list of groups.values()) {
  list.sort((a, b) => (a.exif.taken ?? a.name).localeCompare(b.exif.taken ?? b.name));
  for (let i = 1; i < list.length; i++) {
    if (hamming(list[i].dhash, list[i - 1].dhash) <= 4) {
      list[i].similarTo = list[i - 1].similarTo ?? list[i - 1].id;
      nearDuplicates.push([list[i - 1].name, list[i].name]);
    }
  }
}

await mkdir(PUBLIC, { recursive: true });
const publicPhotos = photos.filter((p) => !curation.collections.find((c) => c.slug === p.collection)?.hidden && !p.hidden);
console.log(`writing variants for ${publicPhotos.length} public photos`);
const byId = new Map(kept.map((f) => [idFor(f.driveId), f]));
await pool(publicPhotos, (p) => variants(byId.get(p.id), p));

/** Social cards: JPEG, because most link unfurlers still reject AVIF. Only for frames that represent a page. */
const OG = join(ROOT, "public/og");
await mkdir(OG, { recursive: true });
const shareIds = new Set([curation.descent?.hero, curation.descent?.finale, ...curation.collections.map((c) => c.cover)].filter(Boolean));
const shareFiles = new Set();
for (const p of publicPhotos.filter((p) => shareIds.has(p.id))) {
  const out = join(OG, `${p.file}.jpg`);
  shareFiles.add(`${p.file}.jpg`);
  if (existsSync(out)) continue;
  const f = byId.get(p.id);
  await sharp(await readFile(join(ORIGINALS, f.local)), { failOn: "none" })
    .rotate()
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .withIccProfile("srgb")
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
}
if (LIMIT === Infinity) for (const n of await readdir(OG)) if (!shareFiles.has(n)) await rm(join(OG, n));

const wanted = new Set(publicPhotos.flatMap((p) => WIDTHS.map((w) => `${p.file}-${w}.avif`)));
const stale = (await readdir(PUBLIC)).filter((n) => n.endsWith(".avif") && !wanted.has(n));
if (LIMIT === Infinity) for (const n of stale) await rm(join(PUBLIC, n));

for (const p of photos) delete p.dhash;
await mkdir(join(ROOT, "src/data"), { recursive: true });
await writeFile(MANIFEST, JSON.stringify({ generatedAt: new Date().toISOString(), widths: WIDTHS, photos }, null, 1) + "\n");

let bytes = 0;
for (const n of await readdir(PUBLIC)) bytes += (await stat(join(PUBLIC, n))).size;
const report = {
  builtAt: new Date().toISOString(),
  inventory: inventory.files.length,
  analysed: analysed.size,
  missingLocally: missing.length,
  unreadable,
  identicalDuplicates: duplicates,
  nearDuplicatePairs: nearDuplicates.length,
  unassignedFolders: [...unassigned],
  manifest: photos.length,
  public: publicPhotos.length,
  held: photos.length - publicPhotos.length,
  withEv: photos.filter((p) => p.ev != null).length,
  publicAssetMB: round(bytes / 1e6, 1),
  failedDownloads: inventory.failures ?? [],
  skippedNonJpeg: (inventory.skipped ?? []).length,
};
await writeFile(REPORT, JSON.stringify(report, null, 1) + "\n");
console.log(JSON.stringify({ ...report, identicalDuplicates: duplicates.length, failedDownloads: report.failedDownloads.length }, null, 1));
