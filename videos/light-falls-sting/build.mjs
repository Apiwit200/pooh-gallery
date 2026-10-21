// Generates index.html from the photo manifest: a late-night broadcast sting built from real frames.
// Rerun after `npm run photos:build` in the site root: node build.mjs
import { copyFile, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";

const SITE = new URL("../../", import.meta.url).pathname;
const HERE = new URL("./", import.meta.url).pathname;
const sharp = createRequire(join(SITE, "package.json"))("sharp");

// Island at noon, a deer, the sea at Pattaya, the zoo, New Year fireworks, then Andromeda.
const IDS = ["92187ec039", "f022a8230f", "35872fe992", "8632a8eba9", "1e2f12a7a6", "c709572997"];
const DURATION = 10;
const FIRST = 1.4;
const SLOT = 1;
const TITLE_AT = FIRST + IDS.length * SLOT;
const DEEP = "beyond-the-frame";

const { photos } = JSON.parse(await readFile(join(SITE, "src/data/photos.json"), "utf8"));
const curation = JSON.parse(await readFile(join(SITE, "src/data/curation.json"), "utf8"));

// Channel numbers exactly as the site assigns them: newest collection first, the deep sky last.
const live = photos.filter((p) => !p.held && !p.hidden);
const channels = curation.collections
  .filter((c) => !c.hidden && live.some((p) => p.collection === c.slug))
  .map((c) => ({ ...c, last: live.filter((p) => p.collection === c.slug).map((p) => p.exif.taken ?? "").sort().at(-1) }))
  .sort((a, b) => (a.slug === DEEP) - (b.slug === DEEP) || b.last.localeCompare(a.last));

const frames = [];
for (const [i, id] of IDS.entries()) {
  const p = live.find((x) => x.id === id);
  if (!p) throw new Error(`photo ${id} is not public in the manifest; run the ingest first`);
  const name = `f${i}.avif`;
  await copyFile(join(SITE, "public/photos", `${p.file}-1920.avif`), join(HERE, "assets", name));
  const ch = channels.findIndex((c) => c.slug === p.collection) + 1;
  frames.push({ name, focus: p.focus, ch: `CH ${String(ch).padStart(2, "0")}`, title: p.title ?? channels[ch - 1].title });
}

// Three frames of seeded static, drawn at a quarter size and scaled up square.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
for (let n = 0; n < 3; n++) {
  const w = 480, h = 270, buf = Buffer.alloc(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    const v = rand() < 0.5 ? Math.round(rand() * 90) : 140 + Math.round(rand() * 115);
    const tint = rand() < 0.04;
    buf[i * 3] = tint ? 53 : v;
    buf[i * 3 + 1] = tint ? 10 : v;
    buf[i * 3 + 2] = tint ? 255 : v;
  }
  await sharp(buf, { raw: { width: w, height: h, channels: 3 } }).png().toFile(join(HERE, "assets", `static-${n}.png`));
}

const cuts = [FIRST, ...frames.map((_, i) => FIRST + (i + 1) * SLOT)];
// The site's aperture ornament, 7×7.
const MARK = "oxxxxxo" + "xxoooxx" + "xooooox" + "xooxoox" + "xooooox" + "xxoooxx" + "oxxxxxo";
const bars = ["#f4f4ff", "#bcf015", "#ebedf5", "#350aff", "#1a0080", "#bcf015", "#120d2b"];

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Jacquard 24"; src: url("assets/jacquard.woff2") format("woff2"); }
      @font-face { font-family: "Geist Pixel"; src: url("assets/geist-pixel.woff2") format("woff2"); }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; overflow: hidden; background: #350aff; }
      #root { width: 100%; height: 100%; position: relative; overflow: hidden; background: #350aff; color: #f4f4ff; font-family: "Geist Pixel", monospace; }
      .layer { position: absolute; inset: 0; overflow: hidden; }
      .pixel { font-family: "Geist Pixel", monospace; text-transform: uppercase; letter-spacing: 0.02em; }

      #card { display: grid; grid-template-rows: 68% 10% 22%; background: #120d2b; }
      #card .row { display: grid; grid-template-columns: repeat(7, 1fr); }
      #card .row--low { grid-template-columns: 2fr 1fr 2fr 1fr 1fr; }
      #card .plate { position: absolute; left: 50%; top: 50%; translate: -50% -50%; padding: 34px 54px; background: #120d2b; box-shadow: 0 0 0 8px #bcf015; text-align: center; }
      #card .plate b { display: block; font-weight: 400; font-size: 76px; line-height: 1; color: #bcf015; }
      #card .plate span { display: block; margin-top: 18px; font-size: 30px; color: #f4f4ff; }

      .ch img { display: block; width: 100%; height: 100%; object-fit: cover; }
      .ch--sky { background: #03000f; }
      .ch--sky img { object-fit: contain; }
      .chip { position: absolute; left: 72px; top: 64px; padding: 14px 18px 12px; background: #bcf015; color: #120d2b; font-size: 44px; line-height: 1; }
      .name { position: absolute; left: 72px; bottom: 72px; padding: 12px 16px 10px; background: #350aff; color: #f4f4ff; font-size: 34px; line-height: 1; }

      #end { background: #350aff; display: grid; place-content: center; justify-items: center; gap: 34px; }
      #title { font-family: "Jacquard 24", serif; font-weight: 400; font-size: 330px; line-height: 0.82; color: #f4f4ff; }
      #credit { font-size: 44px; color: #bcf015; }
      #mark { width: 112px; height: 112px; display: grid; grid-template-columns: repeat(7, 1fr); }
      #mark i { background: #bcf015; }
      #mark i.o { background: transparent; }
      #end .chip { background: #bcf015; }

      #static { background-size: cover; image-rendering: pixelated; opacity: 0; }
      #scan { background: repeating-linear-gradient(to bottom, rgb(0 0 20 / 0.22) 0 2px, transparent 2px 6px); pointer-events: none; }
      #vignette { background: radial-gradient(ellipse 130% 95% at 50% 50%, transparent 62%, rgb(0 0 20 / 0.45) 100%); box-shadow: inset 0 0 140px 30px rgb(0 0 20 / 0.32); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${DURATION}" data-width="1920" data-height="1080">
      <div id="card" class="layer">
        <div class="row">${bars.map((c) => `<i style="background:${c}"></i>`).join("")}</div>
        <div class="row">${[...bars].reverse().map((c) => `<i style="background:${c}"></i>`).join("")}</div>
        <div class="row row--low">${["#1a0080", "#f4f4ff", "#350aff", "#120d2b", "#bcf015"].map((c) => `<i style="background:${c}"></i>`).join("")}</div>
        <div class="plate pixel"><b>Please stand by</b><span>Light Falls · ${channels.length} channels</span></div>
      </div>
${frames
  .map(
    (f, i) => `      <div id="ch-${i}" data-layout-allow-overflow class="layer ch${i === frames.length - 1 ? " ch--sky" : ""}" style="opacity:0">
        <img id="img-${i}" src="assets/${f.name}" alt="" style="object-position:${Math.round(f.focus[0] * 100)}% ${Math.round(f.focus[1] * 100)}%" />
        <span class="chip pixel">${f.ch}</span>
        <span class="name pixel">${f.title}</span>
      </div>`,
  )
  .join("\n")}
      <div id="end" class="layer" style="opacity:0">
        <span class="chip pixel">End of transmission</span>
        <div id="mark">${MARK.split("").map((c) => `<i${c === "o" ? ' class="o"' : ""}></i>`).join("")}</div>
        <h1 id="title">Light Falls</h1>
        <p id="credit" class="pixel">Photographs by Apiwit Nathong</p>
      </div>
      <div id="static" class="layer"></div>
      <div id="scan" class="layer"></div>
      <div id="vignette" class="layer"></div>
    </div>
    <script>
      const cuts = ${JSON.stringify(cuts)};
      const count = ${frames.length};
      const tl = gsap.timeline({ paused: true });
      // Each cut: three frames of static, then the next channel snaps on underneath.
      cuts.forEach((t, k) => {
        const s = t - 0.18;
        [0, 1, 2].forEach((n) => tl.set("#static", { opacity: 1, backgroundImage: "url(assets/static-" + ((n + k) % 3) + ".png)" }, s + n * 0.06));
        tl.set("#static", { opacity: 0 }, t);
        const prev = k === 0 ? "#card" : "#ch-" + (k - 1);
        const next = k === count ? "#end" : "#ch-" + k;
        tl.set(prev, { opacity: 0 }, t);
        tl.set(next, { opacity: 1 }, t);
        if (k < count) {
          tl.fromTo("#img-" + k, { scale: 1.06 }, { scale: 1, duration: 1.1, ease: "power2.out" }, t);
          tl.fromTo("#ch-" + k + " .chip", { opacity: 0 }, { opacity: 1, duration: 0.24, ease: "steps(3)" }, t + 0.06);
          tl.fromTo("#ch-" + k + " .name", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.36, ease: "steps(6)" }, t + 0.12);
        }
      });
      tl.fromTo("#card .plate", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "steps(3)" }, 0.15);
      const end = ${TITLE_AT};
      tl.fromTo("#mark i", { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: { each: 0.008, from: "random" } }, end + 0.05);
      tl.fromTo("#title", { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.6, ease: "steps(9)" }, end + 0.3);
      tl.fromTo("#credit", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "steps(3)" }, end + 0.9);
      tl.fromTo("#end .chip", { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "steps(2)" }, end + 1.2);
      tl.to("#scan", { backgroundPositionY: 12, duration: ${DURATION}, ease: "none" }, 0);
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
await writeFile(join(HERE, "index.html"), html);
console.log(`wrote index.html: test card, ${frames.map((f) => f.ch).join(" → ")}, title at ${TITLE_AT}s`);
