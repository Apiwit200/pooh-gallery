---
name: Light Falls
description: Photographs by Apiwit Nathong, ordered as one descent through light, from the brightest noon to the deep sky.
colors:
  daylight: "#e6e8ea"
  shade: "#b8c1b2"
  dusk: "#86a59c"
  lamplight: "#1d4652"
  night: "#0c1824"
  deep: "#04060a"
  ink: "#10181b"
  paper: "#ebe7dd"
  photo-white: "#f4f1ea"
typography:
  display:
    fontFamily: "Mona Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(4rem, 14vw, 13rem)"
    fontWeight: 560
    lineHeight: 0.86
    letterSpacing: "-0.035em"
    fontVariation: "\"wdth\" 75"
  headline:
    fontFamily: "Mona Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 5.5rem)"
    fontWeight: 560
    lineHeight: 0.86
    letterSpacing: "-0.035em"
    fontVariation: "\"wdth\" 75"
  title:
    fontFamily: "Mona Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3.6vw, 3.25rem)"
    fontWeight: 540
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontVariation: "\"wdth\" 76"
  lead:
    fontFamily: "Mona Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 1.6vw + 0.8rem, 2.25rem)"
    fontWeight: 400
    lineHeight: 1.22
    letterSpacing: "-0.012em"
    fontVariation: "\"wdth\" 92"
  body:
    fontFamily: "Mona Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 0.4vw + 0.95rem, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.5
    fontVariation: "\"wdth\" 100"
  label:
    fontFamily: "Mona Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  reading:
    fontFamily: "Geist Mono Variable, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.02em"
    fontFeature: "\"tnum\" 1"
rounded:
  none: "0"
spacing:
  gutter: "clamp(1rem, 3.2vw, 2.75rem)"
  rail: "clamp(2.25rem, 4vw, 4.5rem)"
  section: "clamp(6rem, 16vh, 11rem)"
  nav-h: "3.5rem"
  block-gap: "clamp(4rem, 12vh, 9rem)"
  pair-gap: "clamp(0.75rem, 2.5vw, 2.5rem)"
  grid-gap: "clamp(0.375rem, 0.8vw, 0.75rem)"
components:
  nav-bar:
    backgroundColor: "{colors.daylight}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    height: "{spacing.nav-h}"
    padding: "0 calc(gutter + rail) 0 gutter"
  nav-bar-over-photo:
    textColor: "{colors.photo-white}"
    height: "{spacing.nav-h}"
  ev-rail:
    textColor: "{colors.ink}"
    typography: "{typography.reading}"
    width: "{spacing.rail}"
  frame:
    rounded: "{rounded.none}"
  index-menu:
    backgroundColor: "{colors.night}"
    textColor: "{colors.paper}"
    padding: "0 gutter 3rem"
  index-row:
    typography: "{typography.title}"
    padding: "0.9rem 0"
  pager-page-current:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.daylight}"
    typography: "{typography.reading}"
    size: "2.75rem"
    rounded: "{rounded.none}"
  viewer:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.paper}"
    typography: "{typography.reading}"
---

# Design System: Light Falls

## Overview

**Creative North Star: "The Descent Through Light"**

The site is one committed field whose colour is a function of depth. Every photograph is placed by the exposure value its own EXIF records, and the page ground steps down with it: film-white daylight, sage shade, sea-teal dusk, deep-teal lamplight, ink-navy night, then near-black with stars. The photograph is always the loudest thing on the screen; the ground, the type and the meter exist to say how bright it was.

Density is low and the rhythm is vertical. Photographs arrive one composition at a time (full, offset, pair, strip, quiet) with generous open ground between them. Type works at two extremes only: a narrow grotesk at poster scale for chapter and page names, and a small mono for readings. A hairline light-meter rail on the right edge carries the whole EV scale in ghost ticks and lights only the current reading.

The world is flat and square. There are no cards, no rounded boxes and no glass panels; separation comes from ground colour, hairlines and open space.

**Key Characteristics:**
- One ground per chapter, stepped at chapter boundaries, never a gradient.
- Photographs full-colour and unaltered, held inside the gutters, square-cornered.
- Narrow Mona Sans at extreme scale for names; Geist Mono only for measurements.
- A fixed EV rail on the right that widens the right gutter everywhere it appears.
- Hairlines (1px) are the only rules; nothing is boxed.

## Colors

A cool, desaturated depth scale from film-white to near-black, with no accent: the photographs supply all the colour.

### Primary
The grounds. Each stratum owns exactly one; the root `data-ground` attribute swaps them and the page transitions in 0.9s on the expo-out curve.
- **Film White** (daylight): the brightest ground, the first page state and the default for archive, index and about. Cool, slightly grey, never pure white.
- **Sage Shade** (shade): the second chapter; grey-green, still a light ground carrying ink text.
- **Sea Teal** (dusk): the last light ground; ink text still holds.
- **Deep Teal** (lamplight): the first dark ground; text flips to paper.
- **Ink Navy** (night): the night chapter, and the ground of the full-screen index menu, contact and 404.
- **Near Black** (deep): the deep sky, the finale, and the photo viewer backdrop.

### Neutral
- **Ink** (ink): text and the rail on the three light grounds; also the fill of the current pager page.
- **Paper** (paper): text on lamplight, night and deep-sky; warm against the cool grounds.
- **Photo White** (photo-white): type set directly over a photograph (opening title, collection cover title, nav while it floats over a cover). Slightly warmer and brighter than paper so it holds against bright skies.
- **Dim text**: not a separate colour; text at 84% foreground mixed into the current ground (oklab), so it follows every ground automatically. Used for ranges, metadata and secondary lines.
- **Hairline**: foreground at 22% over transparent. On the fixed night/deep surfaces (menu, observing log) the hairline is paper at 10 to 18%.

### Named Rules
**The One Ground Rule.** A screen shows one ground colour at a time, chosen by the chapter that holds the middle of the viewport. Grounds step at chapter boundaries; they do not interpolate, and no gradient ever stands in for depth.

**The No Accent Rule.** There is no brand accent. Emphasis comes from scale, the lit rail marker, or inverting ink and ground (the current pager page, text selection). Never introduce a coloured highlight.

## Typography

**Display Font:** Mona Sans Variable (with ui-sans-serif, system-ui)
**Body Font:** Mona Sans Variable, at normal width
**Label/Mono Font:** Geist Mono Variable (with ui-monospace)

**Character:** One grotesk family, stretched across its width axis: compressed (wdth 75) and heavy-ish at poster scale for names, near-normal width for reading. The mono is small, uppercase and tabular, set like a meter display.

### Hierarchy
- **Display** (560, wdth 75, line-height 0.86, tracking -0.035em, text-wrap balance): chapter names on the descent and page titles. Size is set per surface between `clamp(3.5rem, 11vw, 10rem)` and the opening title at `clamp(4.5rem, 17vw, 15rem)`; the frontmatter value is the chapter-name size. Pulled -0.04em left to align optically with the gutter. Chapter names rise line by line out of their own clip.
- **Headline** (display settings at `clamp(2.5rem, 6vw, 5.5rem)`): finale line, neighbouring-collection titles, stratum names in the index menu.
- **Title** (540, wdth 76, line-height 1): rows in the collection index, pager steps, object names in the deep sky (420, wdth 80, `clamp(2rem, 3.4vw, 3.25rem)`).
- **Lead** (400, wdth 92, line-height 1.22): the homepage prologue and the about statement; under 40rem.
- **Body** (400, line-height 1.45 to 1.5, text-wrap pretty): intros and chapter lines, held to 30 to 36rem.
- **Label** (0.875rem): nav links, chapter collection links, menu close.
- **Reading** (Geist Mono, 0.6875rem, uppercase, tabular numerals, tracking 0.02em): EV values and ranges, frame counts, dates, camera facts, the rail numerals (0.625rem), the viewer caption.

### Named Rules
**The Measurement Rule.** Mono is for measurements only: EV readings, ranges, counts, dates, focal lengths, exposure facts. A sentence, a call to action or a navigation label is never set in mono.

**The Two Extremes Rule.** Names are either poster-scale display or ordinary label size. There is no mid-scale heading voice and no label stacked above a heading: kicker and eyebrow lines are banned.

## Layout

A single vertical axis. Every page section pads left by the gutter and right by gutter plus rail (`padding-inline: gutter, gutter + rail`), so nothing ever runs under the EV rail. Pages without the rail (contact, 404) pad the gutter on both sides.

On the descent and in collections, each chapter's photographs are composed from their real orientations into five blocks, separated by the block gap:
- **Full**: a landscape at the full content width, capped at 100svh, still inside both gutters.
- **Offset**: a single frame at up to 58rem / 58vw (62vw in collections), pushed right, or pushed left by `clamp(gutter, 9vw, 10rem)`; alternates sides. Below 48rem it becomes 88% wide.
- **Pair**: two portraits side by side, the second dropped by `clamp(3rem, 16vh, 12rem)`; at 64rem and up the columns go 5fr/4fr with a 16% left indent.
- **Strip**: a run of landscapes. On the descent it scrolls horizontally inside the gutters (track padded by the gutter, block stopped short of the rail); in collections it falls back to an auto-fit grid of 22rem columns.
- **Quiet**: one small frame (`clamp(11rem, 24vw, 22rem)`) centred in open ground, always closing a chapter.

Full archives use a justified-row grid: each frame flexes by its real aspect ratio around a target row height (`clamp(9rem, 22vw, 17rem)`, 7.5rem on phones) with a tight grid gap.

Covers and the opening frame are the only full-bleed images; they sit at 100svh behind the nav with a soft top and bottom scrim for type. Portrait covers split instead: text left, cover in the right 45vw.

Chapter heads place the display name left and a 22rem meta column (line, range, collection links) bottom-aligned on the right from 64rem. Breakpoints in use: 30rem, 40rem, 48rem, 52rem (nav links appear), 64rem.

## Elevation & Depth

Flat. There are no shadows anywhere. Depth is literal: it is carried by the ground stepping darker chapter by chapter, and by photographs revealing as they arrive (clip-path insets scrubbed by scroll, a canvas "develop" on full frames, a fade-in once pixels land over a low-quality placeholder and the photograph's mean colour). The deep-sky chapter adds a restrained canvas starfield (pale blue-white points, slow twinkle, frozen under reduced motion) behind the photographs.

### Named Rules
**The Literal Depth Rule.** Depth means darker ground, not lift. No box-shadows, no stacked surfaces, no layered panels.

## Shapes

Every edge is square (0 radius): frames, menu, pager cells, focus outlines. Rules are 1px hairlines in the current foreground at 22%. Underlines are 1px, offset 0.28em. The only recurring geometry is the rail: a vertical hairline with short minor ticks (0.375rem) and longer major ticks every 4 EV (0.75rem), and a 1.5rem marker bar.

## Components

### Navigation
Quiet and fixed. A 3.5rem bar: the title in narrow 620-weight Mona Sans with the photographer's name beside it at 0.8125rem, links at label size on the right (Index, Archive, Deep sky, About). The bar sits on the current ground at 92% with a hairline beneath (its current 10px backdrop blur is drift from the no-glass world, not a pattern to reuse); over a cover photograph it goes transparent and photo-white. Links use the directional trace underline. Below 52rem the links collapse to one "Index" button that opens the index menu. The name hides below 30rem.

### Directional Trace (links)
A 1px underline that draws in from the left on hover, focus or current page and leaves to the right (0.35s, expo-out). Never rewinds. Used for nav, chapter collection links and the finale links.

### EV Rail (signature)
A fixed hairline meter on the right edge, rail-wide, between the nav and the bottom of the viewport. It carries the full EV scale (16 down to -4) in ghost ticks with dim mono numerals every 4 EV, and a ∞ below the scale. The marker reads the light at the middle of the viewport: it interpolates between the measured frames above and below, holds through headings and gaps, and drops past the scale to ∞ in the deep sky. The current reading is printed vertically at the foot in mono ("EV 8.6", or "EV — beyond the scale"). On phones the rail narrows to 1.25rem and the numerals hide. It is decorative to assistive tech (aria-hidden).

### Frames (photographs)
Square, unbordered, never cropped by a card. The frame reserves its exact aspect ratio and shows the photograph's blurred placeholder and mean colour until the image fades in (0.7s). Every frame opens the uncropped photograph in the viewer. In grids, hovering one frame scales it 1.025 and desaturates its neighbours.

### Index Rows
Hairline-separated rows: EV reading in mono, collection title at title scale, count and dates in mono on the right, a 9rem thumbnail from 48rem. Hover nudges the title 0.5rem right.

### Index Menu
A full-screen dialog on the night ground in paper. Each stratum name at headline scale over a column list of its collections, each with its median EV and count in mono.

### Pager
Previous and next steps at title scale on either side, numbered pages as 2.75rem square mono cells between; the current page inverts to ink on ground.

### Viewer
PhotoSwipe on the deep ground. The photograph alone; its caption (title, date, EV, camera facts) set like a meter reading in paper at the foot, hidden when the UI hides.

## Do's and Don'ts

### Do:
- **Do** give each chapter one ground and step to the next at the chapter boundary (daylight #e6e8ea through deep #04060a).
- **Do** keep every block (full, offset, pair, strip) inside the gutters, with the right gutter widened by the rail wherever the rail is shown.
- **Do** set every EV value, count, date and exposure fact in Geist Mono at 0.6875rem, uppercase, tabular.
- **Do** set names at poster scale in Mona Sans wdth 75, weight 560, line-height 0.86, tracking -0.035em.
- **Do** let the EV rail interpolate between measured frames and read ∞ in the deep sky.
- **Do** separate with 1px hairlines and open ground, never with boxes.
- **Do** honour reduced motion: ground changes, reveals, rail marker and starfield all go still.

### Don't:
- **Don't** put a kicker or eyebrow label above a heading.
- **Don't** use mono for sentences, buttons or navigation labels; mono is for measurements only.
- **Don't** interpolate or gradient the ground between chapters.
- **Don't** round corners, add drop shadows, or use cards or glass panels.
- **Don't** add an accent colour; the photographs carry the colour.
- **Don't** grade, tint or filter a photograph at rest; the only colour change is the transient grid-hover dim of neighbouring frames, and the viewer always shows the full, uncropped frame.
