import curationData from "@/data/curation.json";
import manifest from "@/data/photos.json";

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
  ev: number | null;
  luma: number;
  color: string;
  /** Salient centre as [x, y] fractions; drives object-position on every crop. */
  focus: [number, number];
  lqip: string;
  exif: Exif;
  similarTo?: string;
  title?: string;
  alt?: string;
  featured?: boolean;
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

export interface Collection {
  slug: string;
  title: string;
  intro: string;
  photos: Photo[];
  cover: Photo;
  sequence: Photo[];
  ev: { top: number; median: number; bottom: number } | null;
  dates: { from: string; to: string } | null;
  stratum: Stratum;
}

export interface Stratum {
  key: "daylight" | "shade" | "dusk" | "lamplight" | "night" | "deep-sky";
  name: string;
  /** Lowest EV that still belongs to this stratum. */
  floor: number;
}

/** The descent, top to bottom. Boundaries are exposure values (EV at ISO 100). */
export const STRATA: readonly Stratum[] = [
  { key: "daylight", name: "Daylight", floor: 12 },
  { key: "shade", name: "Shade", floor: 9 },
  { key: "dusk", name: "Dusk", floor: 6 },
  { key: "lamplight", name: "Lamplight", floor: 2 },
  { key: "night", name: "Night", floor: -Infinity },
];
export const DEEP_SKY: Stratum = { key: "deep-sky", name: "Beyond the Frame", floor: -Infinity };
export const DEEP_SKY_SLUG = "beyond-the-frame";

/** The EV scale the light-meter rail draws, top to bottom. */
export const EV_SCALE = { top: 16, bottom: -4 } as const;

export const WIDTHS: readonly number[] = manifest.widths;

const curation = curationData as { collections: CurationCollection[] };
const hiddenCollections = new Set(curation.collections.filter((c) => c.hidden).map((c) => c.slug));

export const photos: Photo[] = (manifest.photos as Photo[]).filter(
  (p) => !p.hidden && !hiddenCollections.has(p.collection),
);
const byId = new Map(photos.map((p) => [p.id, p]));

export const photo = (id: string): Photo => {
  const p = byId.get(id);
  if (!p) throw new Error(`Unknown or hidden photo id "${id}" referenced in curation.json`);
  return p;
};

export const stratumFor = (ev: number | null): Stratum =>
  ev == null ? DEEP_SKY : (STRATA.find((s) => ev >= s.floor) ?? STRATA[STRATA.length - 1]!);

/** Luminance thresholds stand in for EV only to place frames that carry no exposure data; they are never shown as EV. */
const LUMA_FLOORS: [number, Stratum["key"]][] = [[0.22, "daylight"], [0.12, "shade"], [0.06, "dusk"], [0.02, "lamplight"]];

export const photoStratum = (p: Photo): Stratum => {
  if (p.collection === DEEP_SKY_SLUG) return DEEP_SKY;
  if (p.ev != null) return stratumFor(p.ev);
  const key = LUMA_FLOORS.find(([floor]) => p.luma >= floor)?.[1] ?? "night";
  return STRATA.find((s) => s.key === key)!;
};

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)]!;
};

const byTaken = (a: Photo, b: Photo) => (a.exif.taken ?? a.name).localeCompare(b.exif.taken ?? b.name);

function build(c: CurationCollection): Collection | null {
  const list = photos.filter((p) => p.collection === c.slug).sort(byTaken);
  if (!list.length) return null;
  const evs = list.flatMap((p) => (p.ev == null ? [] : [p.ev]));
  const dates = list.flatMap((p) => (p.exif.taken ? [p.exif.taken] : [])).sort();
  const ev = evs.length ? { top: Math.max(...evs), median: median(evs), bottom: Math.min(...evs) } : null;
  const distinct = list.filter((p) => !p.similarTo);
  const cover =
    (c.cover && list.find((p) => p.id === c.cover)) ||
    distinct.find((p) => p.orientation === "landscape" && ev && p.ev != null && Math.abs(p.ev - ev.median) < 1.5) ||
    distinct[0]!;
  const sequence = c.sequence?.length
    ? c.sequence.flatMap((id) => byId.get(id) ?? [])
    : distinct.filter((p) => p.featured || p.id !== cover.id).filter((_, i, a) => i % Math.max(1, Math.floor(a.length / 7)) === 0).slice(0, 7);
  return {
    slug: c.slug,
    title: c.title,
    intro: c.intro,
    photos: list,
    cover,
    sequence,
    ev,
    dates: dates.length ? { from: dates[0]!, to: dates[dates.length - 1]! } : null,
    stratum:
      c.slug === DEEP_SKY_SLUG
        ? DEEP_SKY
        : ev
          ? stratumFor(ev.median)
          : photoStratum([...list].sort((a, b) => a.luma - b.luma)[Math.floor(list.length / 2)]!),
  };
}

/** Every public collection, ordered by descent: brightest median first, deep sky last. */
export const collections: Collection[] = curation.collections
  .filter((c) => !c.hidden)
  .map(build)
  .filter((c): c is Collection => c !== null)
  .sort((a, b) => {
    if (a.stratum === DEEP_SKY !== (b.stratum === DEEP_SKY)) return a.stratum === DEEP_SKY ? 1 : -1;
    const depth = (c: Collection) => [...STRATA, DEEP_SKY].indexOf(c.stratum);
    if (depth(a) !== depth(b)) return depth(a) - depth(b);
    // Within a stratum, measured collections lead; unmeasured ones follow by median brightness.
    if ((a.ev == null) !== (b.ev == null)) return a.ev == null ? 1 : -1;
    if (a.ev && b.ev) return b.ev.median - a.ev.median;
    const mid = (c: Collection) => [...c.photos].sort((x, y) => x.luma - y.luma)[Math.floor(c.photos.length / 2)]!.luma;
    return mid(b) - mid(a);
  });

export const collection = (slug: string) => collections.find((c) => c.slug === slug);

/** All public photos ordered by descent: measured EV first (brightest to darkest), then unmeasured frames by luminance. */
export const descent: Photo[] = [...photos].sort((a, b) => {
  const depth = (p: Photo) => [...STRATA, DEEP_SKY].indexOf(photoStratum(p));
  if (depth(a) !== depth(b)) return depth(a) - depth(b);
  if ((a.ev == null) !== (b.ev == null)) return a.ev == null ? 1 : -1;
  return a.ev != null && b.ev != null ? b.ev - a.ev : b.luma - a.luma;
});

export const asset = (base: string, p: Photo, w: number) => `${base}photos/${p.file}-${w}.avif`;

export const altFor = (p: Photo, c?: Collection) =>
  p.alt ?? `${p.title ?? "Photograph"} from ${c?.title ?? collection(p.collection)?.title ?? "the archive"}${p.exif.taken ? `, ${formatDate(p.exif.taken)}` : ""}`;

export function formatDate(iso: string) {
  const d = new Date(`${iso}Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export const formatTime = (iso: string) => iso.slice(11, 16);

export { formatEv } from "@/lib/format";

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

interface DescentCuration {
  hero: string;
  finale: string;
  featured: string[];
}
const descentCuration = (curationData as unknown as { descent: DescentCuration }).descent;
export const strataLines = (curationData as unknown as { strata: Record<Stratum["key"], string> }).strata;

const pick = (id: string) => (id ? byId.get(id) : undefined);

/** Featured frames for the homepage, in descent order. Falls back to every collection's sequence when nothing is curated yet. */
export const featured: Photo[] = (() => {
  const chosen = descentCuration.featured.map(pick).filter((p): p is Photo => !!p);
  const list = chosen.length ? chosen : collections.flatMap((c) => [c.cover, ...c.sequence.slice(0, 2)]);
  return descent.filter((p) => list.includes(p));
})();

export const hero: Photo =
  pick(descentCuration.hero) ?? featured.find((p) => p.orientation === "landscape" && p.ev != null) ?? descent[0]!;

export const finale: Photo | undefined = pick(descentCuration.finale);
