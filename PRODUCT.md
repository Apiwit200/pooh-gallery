# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro (static output) + TypeScript + Tailwind CSS, with React islands only where interaction requires them. GSAP + ScrollTrigger + Lenis for motion, PhotoSwipe for the lightbox, Sharp for the image pipeline. Pinned by the user's brief. Primary host Cloudflare Pages (free tier) via GitHub; GitHub Pages via Actions as the fallback.

## Users

Visitors who arrive to look at Apiwit Nathong's photographs: friends, peers, potential collaborators, and people who find the work online. They are browsing, often on a phone, sometimes on a large monitor at night. Their job is to see the work at its best and wander through it.

## Product Purpose

A personal photography portfolio presented as a digital exhibition. It exists so the photographs are seen large, in sequence, and with care. Success means a visitor remembers specific images and the experience of moving through them, and can reach every photograph in the archive, especially every astrophotograph.

## Positioning

The work of one photographer shooting on a Fujifilm X-H2S across Thailand and Taiwan (Pattaya, Khao Yai, Hua Hin, Tuscany-themed sets, zoos, cafés, the sea) plus a body of astrophotography (the Moon, Orion, the Pleiades, M31, Jupiter, the Sun). The site is built from that real archive and its real folder structure, not a template filled with stock.

## Operating Context

Photographs live in three public Google Drive folders. A rerunnable ingestion script crawls them, downloads originals (kept out of git), deduplicates, extracts EXIF, generates optimized web variants and a manifest. The photographer adds photos to Drive and reruns the script. Curation (titles, featured choices, collection assignment, visibility) is edited in one data file.

## Capabilities and Constraints

- Static site only. No paid backend, CMS, or image CDN.
- Every valid astrophotography JPEG must be reachable on the site.
- In the people folders ("Day 25 U&P people", "Athit", "Day 12", "Day 15", "FD home"), any frame with an obvious visible face (portraits, group photos) stays off public pages; the rest are published. The "U" folder is published whole, at the photographer's request.
- Every public frame carries a short story written around what is visible in it (`src/data/stories.json`). Stories never name people or invent facts about the photographer's life.
- GPS metadata is never published.
- Original files stay separate from public assets and are never committed.
- Photographs are never altered by generative tools or heavily graded.
- Free hosting limits (file count, file size, repo size) must be checked against the real asset budget.

## Brand Commitments

- Photographer credit: Apiwit Nathong.
- Exhibition title: open. Chosen by the designer after seeing the photographs ("Fragments of Light" is only a working title).
- Contact email and social profiles: not provided. They stay as clearly marked editable fields and are never invented.

## Evidence on Hand

- About 2,400 JPEGs across 39 Drive folders, plus 13 astrophotographs (`photos/inventory.json` after ingestion).
- Camera EXIF where present (mostly Fujifilm X-H2S, some Lightroom exports).
- No biography, artist statement, press, or client list exists. The About page must not invent one.

## Product Principles

1. The photograph leads. Interface recedes until needed.
2. The whole archive is reachable. Curation chooses what is featured, never what exists.
3. Honest to the source. No invented facts, metadata, or people's consent.
4. Fast on a phone at night. Spectacle never costs usability.

## Accessibility & Inclusion

WCAG 2.2 AA. Full keyboard support in navigation and the lightbox, visible focus, meaningful alt text, and a complete reduced-motion experience.
