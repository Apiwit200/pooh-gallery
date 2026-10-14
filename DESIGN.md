---
name: Light Falls
description: Photographs by Apiwit Nathong, played as channels on a late-night ultramarine broadcast.
colors:
  blue: "#350aff"
  blue-deep: "#1a0080"
  lime: "#bcf015"
  paper: "#ebedf5"
  ink: "#120d2b"
  deep: "#03000f"
  white: "#f4f4ff"
typography:
  display:
    fontFamily: "Jacquard 24, ui-serif, serif"
    fontSize: "clamp(4rem, 13vw, 12rem)"
    fontWeight: 400
    lineHeight: 0.82
    letterSpacing: "0"
  headline:
    fontFamily: "Jacquard 24, ui-serif, serif"
    fontSize: "clamp(3.5rem, 10vw, 10rem)"
    fontWeight: 400
    lineHeight: 0.82
    letterSpacing: "0"
  title:
    fontFamily: "Jacquard 24, ui-serif, serif"
    fontSize: "clamp(2.5rem, 6vw, 5.5rem)"
    fontWeight: 400
    lineHeight: 0.82
    letterSpacing: "0"
  lede:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 1.6vw + 0.9rem, 2.5rem)"
    fontWeight: 450
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Geist Pixel, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "0.02em"
    fontFeature: "\"tnum\" 1"
rounded:
  none: "0px"
  nav: "4px"
spacing:
  gutter: "clamp(1rem, 3vw, 2.5rem)"
  section: "clamp(5rem, 14vh, 10rem)"
  chip-gap: "0.4rem"
  chip-pad: "0.4rem 0.55rem"
  print-mat: "0.5rem 0.5rem 1.6rem"
components:
  chip:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "{spacing.chip-pad}"
  chip-hover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
  chip-blue:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "{spacing.chip-pad}"
  chip-blue-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  chip-ghost-hover:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
  nav-pill:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.nav}"
    padding: "0.35rem 0.4rem 0.35rem 0.75rem"
  print-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.none}"
    padding: "{spacing.print-mat}"
  test-card:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.lime}"
    rounded: "{rounded.none}"
    padding: "0.6rem"
  channel-tag-on:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "0.3rem 0.4rem"
  viewer:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
---

# Design System: Light Falls

## Overview

**Creative North Star: "The Late-Night Broadcast"**

The archive is a surreal television set left on after midnight. An ultramarine screen plays photographs as channels: the visitor tunes in, photographs are thrown onto the glass as the pointer moves, a short transmission gathers itself out of scattered words, a channel guide flips between collections, and the night sky is the last channel before the lime "End of transmission" card. It is retro, surreal and abstract, but the photographs are always the programme; every broadcast device exists to frame them or to step aside for them.

The whole page sits under one CRT layer (scanlines, glare, vignette, bezel shadow, moving grain, and an RGB fringe on display type and featured frames). The CRT is not a texture applied to a surface; it is the glass between the visitor and the set, and it clears exactly over the photograph being looked at. Sections are flat, full-bleed colour fields with square edges. Depth comes from printed photographs (white mats, tilts, soft drop shadows) laid on those fields, never from glass panels or decorative gradients.

Density is low and theatrical: display type at broadcast scale in a pixel blackletter, small uppercase pixel labels for every measurement, and a plain humanist sans for the few sentences that need reading.

**Key Characteristics:**
- Four full-bleed fields (blue, paper, lime, deep); every section sits on exactly one, and its text colour follows from the field.
- Jacquard 24 pixel blackletter for display only; Geist Pixel for labels and measurements; Geist for reading.
- One CRT layer over everything, with a rectangular hole over the hovered or focused photograph.
- Square corners everywhere except the floating nav (4px) and the test card's native circle.
- Authored pixel ornaments (aperture sun, star, arrows) drawn on a grid; no glyph icons.
- Stepped, signal-like motion: scramble, gather, throw, toss, corridor, pixel wipe, pixel resolve.

## Colors

A saturated broadcast palette: one ultramarine, one acid lime, and three neutrals tuned cool toward that blue.

### Primary
- **Broadcast Ultramarine** (blue): the default field of the site, the root background, the browser theme colour and the pixel page wipe. On light fields it is the accent for display type (the active channel name, "End of transmission", "All N frames") fills blue chips and marks the current archive page.
- **Dead-Air Indigo** (blue-deep): the deeper shade behind the ultramarine. Scrollbar track, viewer image placeholder, one test-card bar. Never a section field.

### Secondary
- **Test-Card Lime** (lime): the signal colour. Fills default chips, the "on" channel tag, the closing field, selection highlight, focus rings on dark fields, and one cell in eleven of the pixel wipe. On dark fields it is the accent for small text (pixel labels, ornaments, viewer counter).

### Neutral
- **Studio Paper** (paper): the cool off-white field for the channel guide, collection sequences, grids and About; also the floating nav.
- **Night Ink** (ink): text on paper and lime fields; the test-card and screen bezel.
- **Deep Sky** (deep): the near-black field for the deep-sky channel and the photo viewer.
- **Phosphor White** (white): text on blue and deep fields; the white mat around every print.

### Named Rules
**The Four Fields Rule.** Every section is one of four fields: blue (white text), paper (ink text), lime (ink text), deep (white text). The field sets `--field` and `--fg`; dimmed text (`--fg-dim`, 78% fg) and hairlines (`--hair`, 24% fg) are mixed from them, never picked.

**The Cross-Accent Rule.** Accents cross over: lime marks small text and ornaments on dark fields; blue marks display type and ornaments on light fields. Lime is never used as text on paper or lime; blue is never used as text on blue or deep.

**The Chip Colour Rule.** Among interactive controls, colour fill belongs to chips. Links, list items and nav entries take the field's text colour and signal state with the directional underline, a lime "on" tag, or a colour change on the display name.

## Typography

**Display Font:** Jacquard 24 (with ui-serif, serif)
**Body Font:** Geist Variable (with ui-sans-serif, system-ui, sans-serif)
**Label/Mono Font:** Geist Pixel (with ui-monospace, monospace)

**Character:** A pixel blackletter that reads like a station ident against a precise modern sans; the pixel mono carries every number the way an on-screen display would.

### Hierarchy
- **Display** (400, clamp(4rem, 13vw, 12rem), 0.82): page titles ("Channel guide", "Archive", "Beyond the Frame", "No signal."). The opening title runs slightly smaller with 0.92 leading so real photographs can sit inline between words, ringed in lime. Balanced wrapping. Single weight; never synthesise others.
- **Headline** (400, clamp(3.5rem, 10vw, 10rem), 0.82): section titles on the homepage ("Prints on the table", "Beyond the frame", "End of transmission").
- **Title** (400, clamp(2.5rem, 6vw, 5.5rem), 0.82): channel names in the channel guide and menu, previous and next channel on the dial, deep-sky object names.
- **Lede** (450, clamp(1.375rem, 1.6vw + 0.9rem, 2.5rem), 1.12, -0.02em): the transmission paragraph and page intros, about 44rem wide at most.
- **Body** (400, 1.125rem, 1.45): short reading text, 34 to 40rem wide at most.
- **Label** (400, 0.75rem, 0.02em, uppercase, tabular numbers): channel numbers, frame counts, dates, camera facts, the credit line, nav links, chips, viewer captions.

### Named Rules
**The Display-Only Blackletter Rule.** Jacquard 24 is for display, headline and title roles only, at 2.5rem and above. It never sets a sentence, a label or a control.

**The Pixel Measures Rule.** Every measurement (channel, count, date, camera, light-travel time, page number) is set in Geist Pixel. Facts that read as prose stay in Geist.

**The No-Kicker Rule.** No small label sits above a heading to announce it. A heading's supporting text follows it (a credit line, an "in the order they were made" tail) or sits in a definition list beside it.

## Layout

Full-bleed fields stacked vertically, each padded by the section rhythm (`spacing.section`) and the side gutter (`spacing.gutter`). Inside a field, composition is either centred and theatrical (opening, prints on the table, deep-sky teaser, end card) or a two-column split at 64rem: copy left and a screen right (transmission and test card, collection head and cover, channel list and sticky screen).

The channel guide is the key layout: a list of channel names on the left and a sticky screen on the right (top 5rem) that holds the corridor. Below 64rem the screen becomes a sticky 16:9 band under the nav with the list scrolling beneath it.

Photograph grids are justified rows built from each frame's real aspect ratio (target row clamp(9rem, 22vw, 17rem), 7.5rem on narrow phones). Collection sequences alternate full, offset, pair, strip and quiet blocks, each frame tilted a few degrees. The prints table scatters cards deterministically across five columns and becomes a horizontal snap scroller below 48rem.

Breakpoints in use: 30rem, 40rem, 48rem, 56rem (nav links appear), 64rem (two-column splits), and 768px for the CRT's lighter mobile treatment.

## Elevation & Depth

The fields are flat. Depth belongs to physical prints and to the CRT glass. Prints carry a white mat (a solid spread ring or padding) and a soft, low drop shadow toned to the deep field; they lift a little on hover. The only other lifted surface is the floating nav. Glass blur and decorative gradients are absent; the only gradients in the build are the CRT's own scanlines, glare and vignette, which are the screen, not decoration.

### Shadow Vocabulary
- **Print at rest** (`box-shadow: 0 10px 24px -12px rgb(3 0 15 / 0.6)`): tossed prints on the table.
- **Print lifted** (`box-shadow: 0 18px 36px -14px rgb(3 0 15 / 0.7)`): a tossed print under the pointer.
- **Matted frame** (`box-shadow: 0 0 0 clamp(0.4rem, 0.8vw, 0.7rem) var(--color-white), 0 14px 30px -14px rgb(3 0 15 / 0.45)`): tilted frames in a collection sequence.
- **Floating nav** (`box-shadow: 0 0 0 1px rgb(18 13 43 / 0.12), 0 6px 18px -8px rgb(3 0 15 / 0.45)`): the pill nav only.
- **Hairline screen edge** (`box-shadow: 0 0 0 1px var(--hair)`): bezels of the test card and collection cover screen.

### Named Rules
**The Hole In The Glass Rule.** The CRT layer sits above every page (z-index 2000, pointer-events none) and a rectangular hole the exact size of the hovered or keyboard-focused photograph cuts through it; that photograph also drops its RGB fringe. The photo viewer hides the CRT entirely. Nothing else may sit above the CRT except the pixel wipe and the skip link.

**The Prints Not Panels Rule.** Shadows belong to photographs treated as physical prints. Text containers, fields and controls never take a drop shadow.

## Shapes

Square corners throughout: fields, chips, frames, prints, screens, tiles, the menu sheet. The single rounded silhouette is the floating nav at a 4px radius. The test card keeps its native circle (the station's centre disc holding a photograph and the aperture ornament); it is part of the test-card device, not a licence for rounded surfaces elsewhere.

Ornaments are authored pixel art: the aperture sun (17x17), the star (9x9), and left and right arrows (7x7), drawn as grids of unit squares with crisp edges and filled in the current colour. New marks are drawn the same way, on the grid.

## Components

### Chips
The only coloured controls: square pixel-type tags that switch colour in two hard steps.
- **Style:** lime fill with ink text (default), blue fill with white text (on lime fields), or ghost (transparent, field text colour, 1px inset hairline). Pixel label type, 1 line height, padding per `spacing.chip-pad`, gap 0.4rem in rows.
- **State:** hover and focus switch fill (lime to white, blue to ink, ghost to lime) with `steps(2)` over 0.18s. Arrow ornaments sit inline for previous and next.

### Navigation
- **Pill nav:** fixed, top centre, paper fill, ink text, 4px radius, floating shadow. Holds the aperture mark with the site name in Jacquard 24 (1.35rem), pixel links with the directional underline trace (enters from the left, leaves to the right; persists on the current page) from 56rem, and a square menu button with a pixel hamburger drawn in SVG.
- **Channel menu:** a full-screen blue dialog that wipes down in `steps(9)`; channel number and frame count in lime pixel type flank each name in Jacquard; hover turns the name lime; ghost chips for the remaining pages.
- **Dial:** a lime field closing each collection, previous and next channel names in Jacquard with pixel arrows.

### Channel Guide (signature)
A list of channels beside a sticky screen. The channel at the middle of the viewport, or under the pointer or focus, is "on": its pixel channel tag fills lime and its name turns blue; other names sit at 62% of the field's text colour. The screen plays the corridor: up to 18 of the channel's prints stand side-on in a diagonal row, the page scroll rides along them, a slow swell runs through the row, and each change of channel fires a 0.26s static burst (scanlines and noise in `steps(3)`). Prints in the corridor carry a 4px white mat that turns lime on hover. Beneath the screen a pixel caption reads the current frame. With reduced motion the corridor is not mounted and the screen shows the channel's cover still; tuning still works because it is navigation.

### Prints
- **Tossed print:** white mat (`spacing.print-mat`), tilted up to 9 degrees, draggable with inertia on fine pointers, lands on top when picked up.
- **Thrown photograph:** in the opening, the pointer throws tilted photographs (pool of ten, recycled) behind the title with a 6px white mat; they pop in and shrink away after 1.6s. Without a fine pointer the screen throws one on its own every 1.1s while visible.
- **Matted frame:** collection sequence frames tilt by a few degrees and straighten on hover.

### Photographs (frames)
Every photograph holds its box with its own aspect ratio, a low-quality placeholder and its dominant colour before the image fades in over `steps(4)`. Featured frames resolve from coarse pixels (56px blocks down to one) with a posterised palette widening to full colour. Grid frames scale to 1.025 on hover while their neighbours desaturate. Any frame opens the viewer.

### Test Card
An ink-bezelled 4:3 card: seven vertical bars in the site palette, a centre circle holding a real photograph with the lime aperture ornament in difference blend, and a lime pixel caption ("Please stand by").

### Viewer
PhotoSwipe on the deep field: white icons, lime pixel counter, and a centred pixel caption with title, date, time and camera facts. The CRT is hidden while it is open.

### Page Wipe
On an internal link, a grid of pixels (16 columns, 8 on narrow screens) in ultramarine, one in eleven lime, snaps on in random order; the next page opens covered and its pixels snap off.

## Do's and Don'ts

### Do:
- **Do** put every new section on one of the four fields with the `field-*` class and let text, dim text and hairlines follow from it.
- **Do** use lime as the accent on blue and deep fields and blue as the accent on paper and lime fields.
- **Do** set every measurement (channel, count, date, camera, page) in uppercase Geist Pixel at 0.75rem with tabular numbers.
- **Do** keep Jacquard 24 at 2.5rem and above, weight 400.
- **Do** draw any new mark as a pixel grid in the ornament component, filled with the current colour.
- **Do** treat photographs as prints when they need depth: a white mat, a small tilt, the print shadow.
- **Do** use stepped timing (`steps(n)`) for colour and state changes and `cubic-bezier(0.16, 1, 0.3, 1)` for physical movement.
- **Do** keep every photograph clickable through the CRT and register it so the hole can open over it.
- **Do** disable scramble, gather, trail, toss, corridor, page wipe, pixel resolve, grain and transitions under reduced motion while keeping channel tuning, the menu and the viewer working.

### Don't:
- **Don't** put a kicker or eyebrow label above a heading.
- **Don't** use Unicode glyphs or icon fonts as icons; draw them on the pixel grid.
- **Don't** fill links, buttons or list items with colour where a chip would do; chips are the coloured controls.
- **Don't** round corners on fields, frames, chips or cards; the nav's 4px and the test card's circle are the only curves.
- **Don't** add glass blur, translucent panels or decorative gradients; gradients live only in the CRT layer.
- **Don't** place anything above the CRT layer except the page wipe and the skip link, and don't let the CRT cover the viewer.
- **Don't** set Jacquard 24 for sentences, labels or controls, or synthesise weights it doesn't have.
- **Don't** use colours outside the seven tokens; mix tints from the field with `color-mix` instead.
