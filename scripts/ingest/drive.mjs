const ENTRY =
  /<div class="flip-entry" id="entry-([^"]+)"[\s\S]*?<a href="([^"]+)"[\s\S]*?flip-entry-title">([^<]*)</g;

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

async function fetchText(url, attempt = 0) {
  const res = await fetch(url);
  if (res.ok) return res.text();
  if (attempt < 4) {
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    return fetchText(url, attempt + 1);
  }
  throw new Error(`${res.status} ${url}`);
}

export async function listFolder(id) {
  const html = await fetchText(`https://drive.google.com/embeddedfolderview?id=${id}`);
  return [...html.matchAll(ENTRY)].map(([, entryId, href, title]) => ({
    id: entryId,
    name: decode(title),
    kind: href.includes("/folders/") ? "folder" : "file",
  }));
}

export async function crawl(rootId, path = [], out = { files: [], folders: [] }) {
  const entries = await listFolder(rootId);
  out.folders.push({ id: rootId, path, entries: entries.length });
  for (const e of entries) {
    if (e.kind === "folder") await crawl(e.id, [...path, e.name], out);
    else out.files.push({ driveId: e.id, name: e.name, path });
  }
  return out;
}

export async function download(driveId, dest) {
  const url = `https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=t`;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const res = await fetch(url);
      const type = res.headers.get("content-type") ?? "";
      if (res.ok && !type.startsWith("text/html")) {
        const { writeFile } = await import("node:fs/promises");
        const buf = Buffer.from(await res.arrayBuffer());
        await writeFile(dest, buf);
        return buf.length;
      }
    } catch {
      // Connection resets and truncated bodies are transient on large Drive downloads; retry below.
    }
    await new Promise((r) => setTimeout(r, 1500 * 2 ** attempt));
  }
  throw new Error(`download failed ${driveId}`);
}
