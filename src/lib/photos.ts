import curationData from "@/data/curation.json";
import manifest from "@/data/photos.json";
import storyData from "@/data/stories.json";

export type Orientation = "landscape" | "portrait" | "square";

export interface Exif {
  make?: string;
  model?: string;
  lens?: string;
  focal?: number;
  aperture?: number;
  shutter?: string;
  iso?: number;
  taken?: string;
}

export interface Photo {
  id: string;
  /** Content hash of the original; names the public variant files. */
  file: string;
  name: string;
  source: string;
  folder: string[];
  collection: string;
  width: number;
  height: number;
  orientation: Orientation;
  color: string;
  /** Salient centre as [x, y] fractions; drives object-position on every crop. */
  focus: [number, number];
  lqip: string;
  exif: Exif;
  similarTo?: string;
  title?: string;
  alt?: string;
  /** A short story written around the frame; shown in the viewer. */
  story?: string;
  hidden?: boolean;
  /** Deep sky only: how long the light travelled to reach the camera. */
  lightTravel?: string;
  lightSeconds?: number;
}

interface CurationCollection {
  slug: string;
  title: string;
  folders: string[];
  intro: string;
  hidden?: boolean;
  cover?: string;
  sequence?: string[];
}

interface HomeCuration {
  /** Two photographs set inline in the title, like words. */
  inline: string[];
  /** The pool the pointer throws onto the opening screen. */
  trail: string[];
  /** Frames the homepage may feature. */
  featured: string[];
  finale?: string;
}

export interface Collection {
  slug: string;
  title: string;
  intro: string;
  photos: Photo[];
  cover: Photo;
  sequence: Photo[];
  dates: { from: string; to: string } | null;
  /** Broadcast channel number, in the order channels are listed. */
  channel: number;
}

export const DEEP_SKY_SLUG = "beyond-the-frame";
export const WIDTHS: readonly number[] = manifest.widths;

const curation = curationData as unknown as { collections: CurationCollection[]; home: HomeCuration };
const hiddenCollections = new Set(curation.collections.filter((c) => c.hidden).map((c) => c.slug));

const stories = storyData as Record<string, { alt?: string; story?: string }>;
export const photos: Photo[] = (manifest.photos as unknown as (Photo & { held?: boolean })[])
  .filter((p) => !p.held && !p.hidden && !hiddenCollections.has(p.collection))
  .map((p) => {
    const s = stories[p.id];
    const alt = p.alt ?? s?.alt;
    return { ...p, ...(alt ? { alt } : {}), ...(s?.story ? { story: s.story } : {}) };
  });
const byId = new Map(photos.map((p) => [p.id, p]));
const pick = (ids: string[] = []) => ids.flatMap((id) => byId.get(id) ?? []);

const byTaken = (a: Photo, b: Photo) => (a.exif.taken ?? a.name).localeCompare(b.exif.taken ?? b.name);

function build(c: CurationCollection): Omit<Collection, "channel"> | null {
  const list = photos.filter((p) => p.collection === c.slug).sort(byTaken);
  if (!list.length) return null;
  const dates = list.flatMap((p) => (p.exif.taken ? [p.exif.taken] : [])).sort();
  const distinct = list.filter((p) => !p.similarTo);
  const cover = (c.cover && list.find((p) => p.id === c.cover)) || distinct.find((p) => p.orientation === "landscape") || distinct[0]!;
  const sequence = c.sequence?.length
    ? pick(c.sequence)
    : distinct.filter((p) => p.id !== cover.id).filter((_, i, a) => i % Math.max(1, Math.floor(a.length / 7)) === 0).slice(0, 7);
  return {
    slug: c.slug,
    title: c.title,
    intro: c.intro,
    photos: list,
    cover,
    sequence,
    dates: dates.length ? { from: dates[0]!, to: dates[dates.length - 1]! } : null,
  };
}

/** Every public collection as a channel: newest first, the deep sky always last. */
export const collections: Collection[] = curation.collections
  .filter((c) => !c.hidden)
  .map(build)
  .filter((c): c is Omit<Collection, "channel"> => c !== null)
  .sort((a, b) => {
    if ((a.slug === DEEP_SKY_SLUG) !== (b.slug === DEEP_SKY_SLUG)) return a.slug === DEEP_SKY_SLUG ? 1 : -1;
    return (b.dates?.to ?? "").localeCompare(a.dates?.to ?? "");
  })
  .map((c, i) => ({ ...c, channel: i + 1 }));

export const collection = (slug: string) => collections.find((c) => c.slug === slug);
export const collectionHref = (slug: string) => (slug === DEEP_SKY_SLUG ? "/deep-sky/" : `/c/${slug}/`);

/** The whole public archive, newest frame first; frames without a date follow. */
export const chronological: Photo[] = [...photos].sort((a, b) => {
  if (!a.exif.taken !== !b.exif.taken) return a.exif.taken ? -1 : 1;
  return (b.exif.taken ?? b.name).localeCompare(a.exif.taken ?? a.name);
});

export const home = {
  inline: pick(curation.home.inline),
  trail: pick(curation.home.trail),
  featured: pick(curation.home.featured),
  finale: pick(curation.home.finale ? [curation.home.finale] : [])[0],
};

export const asset = (base: string, p: Photo, w: number) => `${base}photos/${p.file}-${w}.avif`;

export const altFor = (p: Photo, c?: Collection) =>
  p.alt ??
  `${p.title ?? "Photograph"} from ${c?.title ?? collection(p.collection)?.title ?? "the archive"}${p.exif.taken ? `, ${formatDate(p.exif.taken)}` : ""}`;

export function formatDate(iso: string) {
  const d = new Date(`${iso}Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export const formatTime = (iso: string) => iso.slice(11, 16);
export const channelLabel = (n: number) => `CH ${String(n).padStart(2, "0")}`;

export function facts(p: Photo): string[] {
  const e = p.exif;
  return [
    e.model ? `${e.make && !e.model.startsWith(e.make) && e.make !== "FUJIFILM" ? `${e.make} ` : ""}${e.model}` : "",
    e.focal ? `${e.focal}mm` : "",
    e.aperture ? `ƒ/${e.aperture}` : "",
    e.shutter ?? "",
    e.iso ? `ISO ${e.iso}` : "",
  ].filter(Boolean);
}
