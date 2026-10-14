import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const BASE = (process.env.BASE_PATH ?? "/").replace(/\/?$/, "/");
const failures = [];
const fail = (msg) => failures.push(msg);

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const resolveLocal = (ref) => {
  const path = decodeURIComponent(ref.split("#")[0].split("?")[0]);
  if (!path.startsWith(BASE)) return null;
  const rel = path.slice(BASE.length);
  const candidates = [join(DIST, rel), join(DIST, rel, "index.html")];
  return candidates.find((c) => existsSync(c) && !c.endsWith("/")) ?? candidates[0];
};

const html = [];
for await (const f of walk(DIST)) if (f.endsWith(".html")) html.push(f);
if (!html.length) fail("dist/ has no HTML. Run npm run build first.");

const refs = new Map();
for (const file of html) {
  const src = await readFile(file, "utf8");
  for (const m of src.matchAll(/\s(?:src|href|imagesrcset|srcset)="([^"]+)"/g)) {
    const values = m[0].includes("srcset") ? m[1].split(",").map((s) => s.trim().split(/\s+/)[0]) : [m[1]];
    for (const v of values) {
      if (!v || /^(https?:|mailto:|data:|#|javascript:)/.test(v)) continue;
      if (!refs.has(v)) refs.set(v, relative(DIST, file));
    }
  }
  if (!/<title>[^<]{3,}<\/title>/.test(src)) fail(`${relative(DIST, file)} has no title`);
  if (!src.includes('name="description"')) fail(`${relative(DIST, file)} has no meta description`);
  for (const img of src.matchAll(/<img\b[^>]*>/g)) if (!/\salt="[^"]+"/.test(img[0])) fail(`${relative(DIST, file)} has an <img> without alt text`);
}
for (const [ref, from] of refs) {
  const local = resolveLocal(ref);
  if (local === null) fail(`${from} links outside the base path: ${ref}`);
  else if (!existsSync(local)) fail(`${from} points at a missing file: ${ref}`);
}

const manifest = JSON.parse(await readFile(join(ROOT, "src/data/photos.json"), "utf8"));
const curation = JSON.parse(await readFile(join(ROOT, "src/data/curation.json"), "utf8"));
const hidden = new Set(curation.collections.filter((c) => c.hidden).map((c) => c.slug));
const visible = manifest.photos.filter((p) => !p.held && !p.hidden && !hidden.has(p.collection));
const known = new Set(manifest.photos.map((p) => p.id));
const stale = [
  ...curation.collections.flatMap((c) => [c.cover, ...(c.sequence ?? [])].filter(Boolean).map((id) => [c.slug, id])),
  ...[curation.descent?.hero, curation.descent?.finale, ...(curation.descent?.featured ?? [])].filter(Boolean).map((id) => ["descent", id]),
].filter(([, id]) => !known.has(id));
const empty = curation.collections.filter((c) => !c.hidden && !visible.some((p) => p.collection === c.slug)).map((c) => c.slug);
if (stale.length) console.warn(`warning: ${stale.length} curation id(s) no longer in the manifest: ${[...new Set(stale.map(([s]) => s))].join(", ")}`);
if (empty.length) console.warn(`warning: collections with no public photos (not built): ${empty.join(", ")}`);

const deepSky = await readFile(join(DIST, "deep-sky/index.html"), "utf8").catch(() => "");
const astro = visible.filter((p) => p.collection === "beyond-the-frame");
const missingAstro = astro.filter((p) => !deepSky.includes(`photos/${p.file}-`));
if (missingAstro.length) fail(`Deep sky page is missing ${missingAstro.length} astrophotographs: ${missingAstro.map((p) => p.name).join(", ")}`);

let archive = "";
for (const f of html) if (relative(DIST, f).startsWith("archive")) archive += await readFile(f, "utf8");
const missingArchive = visible.filter((p) => !archive.includes(`photos/${p.file}-`));
if (missingArchive.length) fail(`Archive is missing ${missingArchive.length} public photographs`);

const leaked = (await readFile(join(ROOT, "src/data/photos.json"), "utf8")).match(/"(gps|latitude|longitude|GPS\w*)"/i);
if (leaked) fail(`Manifest contains location data (${leaked[1]})`);
for (const p of manifest.photos.filter((p) => p.hidden || hidden.has(p.collection))) {
  if (existsSync(join(ROOT, "public/photos", `${p.file}-480.avif`))) fail(`Held photo ${p.name} has public variants`);
}

let files = 0;
for await (const file of walk(DIST)) if (file) files++;
console.log(`${html.length} pages, ${refs.size} local references, ${files} files in dist, ${astro.length} astrophotographs, ${visible.length} public photographs`);
if (files > 20000) fail(`dist has ${files} files; Cloudflare Pages free allows 20,000`);
if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n- ${failures.slice(0, 50).join("\n- ")}`);
  process.exit(1);
}
console.log("validate: all checks passed");
