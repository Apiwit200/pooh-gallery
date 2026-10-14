# Light Falls

Photographs by Apiwit Nathong, arranged as one descent through light. Each photograph is placed by the exposure value its own EXIF records. The homepage starts at the brightest noon in the archive and goes down through shade, dusk, lamplight and night. Past the bottom of the scale, the deep-sky frames are ordered by how long their light travelled.

Static site: Astro, TypeScript, Tailwind CSS v4, GSAP with ScrollTrigger and Lenis (homepage only), and PhotoSwipe. Images are pre-built AVIF variants, so no image server or paid CDN is needed.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:4321.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Static production build into `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run check` | Astro and TypeScript type check |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run validate` | After a build, checks every local link and asset, alt text, titles and descriptions. It also confirms every public photo is in the Archive, every astrophotograph is on Deep Sky, no location data is published, held photos have no public files, and the file count fits Cloudflare's limit |
| `npm run photos` | Re-ingest photographs from Google Drive (see below) |

## Photographs

### Where they come from

`scripts/ingest/sources.json` lists three public Google Drive folders. No credentials are needed while they stay shared as "anyone with the link".

### Adding new photographs

1. Put the JPEGs into any of the three Drive folders. Subfolders are fine.
2. Run `npm run photos`. That runs two steps:
   - `photos:fetch` crawls every folder recursively and downloads only the originals you don't already have into `photos/originals/`. It checks that each file is a complete JPEG and writes `photos/inventory.json`.
   - `photos:build` analyses each original once and caches the result by content hash in `photos/.cache/`. The analysis covers EXIF (camera, lens, aperture, shutter, ISO and time taken; GPS is never read), exposure value, luminance, average colour, a blur placeholder and a perceptual hash for near-duplicates. It then writes AVIF variants at 480, 1080 and 1920 px into `public/photos/`, the manifest `src/data/photos.json`, and a report `photos/report.json` listing failed downloads, duplicates and unassigned folders.
3. A new Drive folder appears in `photos/report.json` under `unassignedFolders`. Add it to `src/data/curation.json` (see below) and run `npm run photos:build` again.
4. Commit `public/photos/`, `src/data/photos.json` and `photos/inventory.json`. Never commit `photos/originals/`, which is gitignored.

Variant files are named by the content hash of their original. A re-edited photo therefore gets new URLs, so the year-long immutable cache stays correct. Files for removed photos are deleted on the next full build.

### Curation: `src/data/curation.json`

Everything editorial lives in this one file:

- `collections`: one entry per Drive folder, with a `slug` (the URL), `title`, `intro` and `folders`. Optional fields: `cover` (a photo id), `sequence` (photo ids for the curated run at the top of the collection page) and `hidden`.
- `hidden: true` keeps a collection off every public page and generates no public files for it. Six folders where people are the main subject start hidden. Set `hidden` to `false` once everyone shown has agreed to publication, then rerun `npm run photos:build`.
- `photos`: per-photo overrides keyed by photo id, with `title`, `alt`, `featured` and `hidden`.
- `descent`: `hero` (opening photo), `finale` (closing photo), `finaleTitle`, and `featured` (photo ids for the homepage). Order doesn't matter, because the homepage sorts them by measured light.
- `strata`: the one-line text under each stratum heading.

A photo id is the first 10 hex characters of the SHA-1 of its Google Drive file id, so ids stay stable across rebuilds. Find them in `src/data/photos.json`.

### Personal details: `src/lib/site.ts`

`statement` (About text in the photographer's own words), `email` and `links` are empty by default. Nothing is invented. The Contact page stays unlinked and `noindex` until an email or link is added.

## Deployment

### Cloudflare Pages (primary, free plan)

1. Push this repository to GitHub.
2. In the Cloudflare dashboard, open Workers & Pages, choose Create, then Pages, then Connect to Git, and pick the repository.
3. Use these build settings:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variables: `NODE_VERSION` = `22`, and `SITE_URL` = your final origin, e.g. `https://apiwit-nathong.pages.dev` or your custom domain
4. Every push to `main` deploys, and pull requests get preview URLs.
5. To add a custom domain later, go to the project, then Custom domains, then Set up a domain, and update `SITE_URL`.

`public/_headers` gives `/photos/*` and `/_astro/*` a one-year immutable cache.

Free-plan limits checked against this project: 20,000 files per site, 25 MiB per file, 500 builds a month, and a 20-minute build timeout. The site ships about 5,900 AVIF files (about 650 MB), each under 1 MB. Images are pre-built, so the Cloudflare build only runs Astro. `npm run validate` fails the build if the file count passes 20,000.

### GitHub Pages (fallback)

`.github/workflows/pages.yml` builds with the repository sub-path as the base path and deploys with GitHub's Pages actions.

1. Go to Settings, then Pages, and set Source to GitHub Actions.
2. Either run the workflow by hand, or set the repository variable `ENABLE_GITHUB_PAGES` to `true` so it runs on every push to `main`.

GitHub Pages limits: 1 GB published site, a 100 GB/month soft bandwidth cap, and a 10-minute deployment timeout. The image set is about 650 MB, inside the 1 GB limit but not by a wide margin. If the archive grows past roughly 1.4x its current size, drop the 1920 variant for non-featured frames or move GitHub Pages out of the plan.

### Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request: install (cached), type check, lint, unit tests, production build and `validate`.

## Structure

```
scripts/ingest/      Drive crawler, downloader, image pipeline
scripts/validate.mjs Post-build checks
photos/              originals/ (gitignored), .cache/ (gitignored), inventory.json, report.json
public/photos/       Generated AVIF variants (committed)
src/data/            photos.json (generated), curation.json (edited by hand)
src/lib/             Photo model, strata, composition, site config
src/components/      Photo, Grid, Nav (with full-screen index), EvRail, Starfield
src/pages/           Descent (home), index, archive/[page], c/[slug], deep-sky, about, contact, 404
src/scripts/         Viewer (PhotoSwipe), ground changes, homepage motion
```

## Accessibility and motion

All content is visible without JavaScript. With `prefers-reduced-motion`, smooth scrolling, scroll-linked animation, star twinkle and view-transition animations are switched off. Ground colours still change by section. The viewer supports keyboard (arrows and Esc), swipe, pinch zoom and deep links (`#p=<photo id>`). The full-screen index is a native `<dialog>`, which handles focus and Esc.
