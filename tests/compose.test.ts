import { describe, expect, it } from "vitest";
import { compose } from "../src/lib/compose";
import type { Photo } from "../src/lib/photos";

const frame = (id: string, orientation: Photo["orientation"]): Photo => ({
  id,
  file: id,
  name: `${id}.jpg`,
  source: "a",
  folder: [],
  collection: "test",
  width: orientation === "portrait" ? 2 : 3,
  height: orientation === "portrait" ? 3 : 2,
  orientation,
  color: "#000000",
  focus: [0.5, 0.5],
  lqip: "",
  exif: {},
});

const shape = (blocks: ReturnType<typeof compose>) =>
  blocks.map((b) => ("photos" in b ? `${b.kind}:${b.photos.map((p) => p.id).join("")}` : `${b.kind}:${b.photo.id}`));

describe("compose", () => {
  it("pairs neighbouring portraits and ends on a quiet frame", () => {
    expect(shape(compose([frame("a", "landscape"), frame("b", "portrait"), frame("c", "portrait"), frame("d", "landscape")]))).toEqual([
      "full:a",
      "pair:bc",
      "quiet:d",
    ]);
  });

  it("turns a run of four or more landscapes into one filmstrip", () => {
    const photos = ["a", "b", "c", "d", "e", "f", "g", "h"].map((id, i) => frame(id, i === 0 ? "portrait" : "landscape"));
    expect(shape(compose(photos))).toEqual(["offset:a", "strip:bcdefg", "quiet:h"]);
  });

  it("never places two full-bleed frames back to back", () => {
    const blocks = compose(["a", "b", "c", "d"].map((id) => frame(id, "landscape")));
    expect(blocks.map((b) => b.kind)).toEqual(["full", "offset", "offset", "quiet"]);
  });

  it("keeps every photograph exactly once", () => {
    const photos = Array.from({ length: 23 }, (_, i) => frame(String(i), i % 3 ? "landscape" : "portrait"));
    const ids = compose(photos).flatMap((b) => ("photos" in b ? b.photos : [b.photo])).map((p) => p.id);
    expect(ids.sort()).toEqual(photos.map((p) => p.id).sort());
  });
});
