import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { crawl, download } from "./drive.mjs";

const ROOT = new URL("../../", import.meta.url).pathname;
const ORIGINALS = join(ROOT, "photos/originals");
const INVENTORY = join(ROOT, "photos/inventory.json");
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 6);
const isJpeg = (name) => /\.jpe?g$/i.test(name);
const safe = (s) => s.replace(/[\/\\:*?"<>|]/g, "_");

const { sources } = JSON.parse(await readFile(join(ROOT, "scripts/ingest/sources.json"), "utf8"));
const previous = await readFile(INVENTORY, "utf8").then(JSON.parse, () => ({ files: [] }));
const known = new Map(previous.files.map((f) => [f.driveId, f]));

const files = [];
const skipped = [];
for (const source of sources) {
  const tree = await crawl(source.driveId);
  console.log(`${source.key}: ${tree.folders.length} folders, ${tree.files.length} files`);
  for (const f of tree.files) {
    if (!isJpeg(f.name)) {
      skipped.push({ source: source.key, path: f.path, name: f.name, reason: "not a JPEG" });
      continue;
    }
    const local = join(source.key, ...f.path.map(safe), safe(f.name));
    files.push({ ...known.get(f.driveId), driveId: f.driveId, source: source.key, folder: f.path, name: f.name, local });
  }
}

const failures = [];
let done = 0;
async function isCompleteJpeg(path) {
  const buf = await readFile(path).catch(() => null);
  return !!buf && buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8 && buf.subarray(-4096).includes(Buffer.from([0xff, 0xd9]));
}

async function ensure(file) {
  const dest = join(ORIGINALS, file.local);
  let existing = await stat(dest).catch(() => null);
  if (existing && !file.sha256 && !(await isCompleteJpeg(dest))) existing = null;
  if (!existing || existing.size === 0 || (file.bytes && existing.size !== file.bytes)) {
    await mkdir(dirname(dest), { recursive: true });
    try {
      await download(file.driveId, dest);
    } catch (err) {
      failures.push({ driveId: file.driveId, local: file.local, error: String(err.message ?? err) });
      return;
    }
  }
  if (!(await isCompleteJpeg(dest))) {
    failures.push({ driveId: file.driveId, local: file.local, error: "incomplete JPEG after download" });
    return;
  }
  if (!file.sha256 || !existing) {
    const buf = await readFile(dest);
    file.bytes = buf.length;
    file.sha256 = createHash("sha256").update(buf).digest("hex");
  }
  if (++done % 50 === 0) console.log(`${done}/${files.length}`);
}

const queue = [...files].sort((x, y) => (x.source === "astro" ? -1 : 0) - (y.source === "astro" ? -1 : 0));
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await ensure(queue.shift());
  }),
);

const failed = new Set(failures.map((f) => f.driveId));
const ok = files.filter((f) => !failed.has(f.driveId));
await mkdir(dirname(INVENTORY), { recursive: true });
await writeFile(
  INVENTORY,
  JSON.stringify({ crawledAt: new Date().toISOString(), files: ok, skipped, failures }, null, 1) + "\n",
);
console.log(`ok ${ok.length}, failed ${failures.length}, skipped non-JPEG ${skipped.length}`);
