// Generates index.html from the photo manifest so every frame and every EV reading is real.
// Rerun after `npm run photos:build` in the site root: node build.mjs
import { copyFile, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const SITE = new URL("../../", import.meta.url).pathname;
const HERE = new URL("./", import.meta.url).pathname;
const IDS = ["92187ec039", "f022a8230f", "a594ec96d4", "35872fe992", "ef35c47010", "1e2f12a7a6", "c709572997"];
const DURATION = 10;
const TITLE_AT = 7.4;

const { photos } = JSON.parse(await readFile(join(SITE, "src/data/photos.json"), "utf8"));
const frames = [];
for (const [i, id] of IDS.entries()) {
  const p = photos.find((x) => x.id === id);
  if (!p) throw new Error(`photo ${id} is not in the manifest yet; run the ingest first`);
  const name = `f${i}.avif`;
  await copyFile(join(SITE, "public/photos", `${p.file}-1920.avif`), join(HERE, "assets", name));
  frames.push({ name, ev: p.ev, focus: p.focus });
}

const slot = TITLE_AT / (frames.length - 1);
const ev = (v) => (v == null ? "EV —" : `EV ${v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)}`);
const top = 16;
const bottom = -4;
const markerY = (v) => (v == null ? 104 : ((top - Math.max(bottom, Math.min(top, v))) / (top - bottom)) * 100);

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Mona Sans"; src: url("assets/mona.woff2") format("woff2"); font-weight: 200 900; font-stretch: 75% 125%; }
      @font-face { font-family: "Geist Mono"; src: url("assets/geist-mono.woff2") format("woff2"); font-weight: 100 900; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; overflow: hidden; background: #04060a; }
      #root { width: 100%; height: 100%; position: relative; overflow: hidden; background: #04060a; color: #ebe7dd; }
      .plate { position: absolute; inset: 0; overflow: hidden; }
      #scrim { position: absolute; inset: 0; background: linear-gradient(to top, rgb(4 6 10 / 0.55), rgb(4 6 10 / 0) 34%), linear-gradient(to left, rgb(4 6 10 / 0.35), rgb(4 6 10 / 0) 18%); }
      .plate img { display: block; width: 100%; height: 100%; object-fit: cover; }
      .plate--last { background: #04060a; }
      .plate--last img { object-fit: contain; }
      #meter { position: absolute; top: 96px; bottom: 170px; right: 96px; width: 40px; border-left: 2px solid rgb(235 231 221 / 0.28); }
      #meter .tick { position: absolute; left: 0; width: 12px; height: 2px; background: rgb(235 231 221 / 0.28); }
      #marker { position: absolute; left: -6px; top: 0; width: 46px; height: 3px; background: #ebe7dd; }
      #reading { position: absolute; right: 96px; bottom: 96px; width: 520px; height: 34px; text-align: right; font: 400 30px/1 "Geist Mono", monospace; letter-spacing: 0.04em; }
      #reading .r { position: absolute; right: 0; top: 0; display: block; white-space: nowrap; opacity: 0; }
      #title { position: absolute; left: 92px; bottom: 150px; font: 560 236px/0.86 "Mona Sans", sans-serif; font-stretch: 75%; letter-spacing: -0.035em; }
      #credit { position: absolute; left: 100px; bottom: 96px; font: 400 34px/1 "Mona Sans", sans-serif; font-stretch: 90%; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${DURATION}" data-width="1920" data-height="1080">
${frames
  .map(
    (f, i) => `      <div id="plate-${i}" data-layout-allow-overflow class="plate${i === frames.length - 1 ? " plate--last" : ""}"><img id="img-${i}" src="assets/${f.name}" alt="" style="object-position:${Math.round(f.focus[0] * 100)}% ${Math.round(f.focus[1] * 100)}%" /></div>`,
  )
  .join("\n")}
      <div id="scrim"></div>
      <div id="meter">
${Array.from({ length: top - bottom + 1 }, (_, i) => `        <span class="tick" style="top:${((i / (top - bottom)) * 100).toFixed(2)}%"></span>`).join("\n")}
        <span id="marker"></span>
      </div>
      <div id="reading">
${frames.map((f, i) => `        <span id="r-${i}" class="r" data-layout-allow-overlap>${ev(f.ev)}${f.ev == null ? " · beyond the scale" : ""}</span>`).join("\n")}
      </div>
      <h1 id="title">Light Falls</h1>
      <p id="credit">Photographs by Apiwit Nathong</p>
    </div>
    <script>
      const frames = ${JSON.stringify(frames.map((f) => ({ ev: f.ev, label: ev(f.ev), y: markerY(f.ev) })))};
      const slot = ${slot.toFixed(4)};
      const tl = gsap.timeline({ paused: true });
      const meter = document.getElementById("meter");
      frames.forEach((f, i) => {
        const plate = "#plate-" + i;
        const img = "#img-" + i;
        const at = i * slot;
        tl.fromTo(plate, { opacity: 0 }, { opacity: 1, duration: i === 0 ? 0.8 : 0.55, ease: "power1.inOut" }, i === 0 ? 0 : at - 0.35);
        tl.fromTo(img, { scale: 1.12 }, { scale: 1, duration: slot + 0.9, ease: "none" }, Math.max(0, at - 0.35));
        tl.to("#marker", { y: (f.y / 100) * meter.clientHeight, duration: i === 0 ? 0.01 : 0.6, ease: "expo.out" }, Math.max(0, at - 0.2));
        tl.fromTo("#r-" + i, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, Math.max(0, at - 0.15));
        if (i > 0) tl.to("#r-" + (i - 1), { opacity: 0, y: -14, duration: 0.3, ease: "power2.in" }, at - 0.2);
      });
      tl.fromTo("#title", { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, ease: "expo.out" }, ${TITLE_AT} + 0.2);
      tl.fromTo("#credit", { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power2.out" }, ${TITLE_AT} + 0.7);
      tl.to(["#meter", "#reading"], { opacity: 0, duration: 0.8 }, ${TITLE_AT} + 0.4);
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
await writeFile(join(HERE, "index.html"), html);
console.log(`wrote index.html with ${frames.length} frames: ${frames.map((f) => ev(f.ev)).join(" → ")}`);
