import type { Photo } from "@/lib/photos";

export type Block =
  | { kind: "full"; photo: Photo }
  | { kind: "offset"; photo: Photo; side: "left" | "right" }
  | { kind: "pair"; photos: [Photo, Photo] }
  | { kind: "strip"; photos: Photo[] }
  | { kind: "quiet"; photo: Photo };

const wide = (p: Photo) => p.orientation === "landscape";

/**
 * Turns one stratum's photographs, already in descent order, into a sequence of compositions.
 * The orientation of the actual frames decides the layout: runs of landscapes become a filmstrip,
 * neighbouring portraits pair up, single frames alternate between full bleed and offset,
 * and the stratum always ends on one small frame in open ground.
 */
export function compose(photos: Photo[]): Block[] {
  const blocks: Block[] = [];
  const rest = [...photos];
  const last = rest.length > 2 ? rest.pop() : undefined;
  let usedStrip = false;
  let side: "left" | "right" = "right";
  let sinceFull = 2;

  while (rest.length) {
    const run = rest.findIndex((p) => !wide(p));
    const wideRun = run === -1 ? rest.length : run;

    if (!usedStrip && wideRun >= 4 && photos.length >= 7 && blocks.length > 0) {
      blocks.push({ kind: "strip", photos: rest.splice(0, Math.min(wideRun, 6)) });
      usedStrip = true;
      continue;
    }

    const p = rest[0]!;
    const next = rest[1];
    if (!wide(p) && next && !wide(next)) {
      blocks.push({ kind: "pair", photos: [rest.shift()!, rest.shift()!] });
      continue;
    }
    rest.shift();
    if (wide(p) && sinceFull >= 2) {
      blocks.push({ kind: "full", photo: p });
      sinceFull = 0;
    } else {
      blocks.push({ kind: "offset", photo: p, side });
      side = side === "left" ? "right" : "left";
      sinceFull++;
    }
  }
  if (last) blocks.push({ kind: "quiet", photo: last });
  return blocks;
}
