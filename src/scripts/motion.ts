import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { developOnce, developOnScroll } from "@/scripts/develop";
import { mountSurf, type SurfFrame } from "@/scripts/surf";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, Draggable, InertiaPlugin);

/* Channel index: the hovered or centred channel lights up and its picture plays in the screen beside it.
   Runs with reduced motion too, because it is navigation, not decoration. */
document.querySelectorAll<HTMLElement>("[data-tuner]").forEach((tuner) => {
  const items = [...tuner.querySelectorAll<HTMLElement>("[data-tuner-item]")];
  const screens = [...tuner.querySelectorAll<HTMLElement>("[data-tuner-screen]")];
  const label = tuner.querySelector<HTMLElement>("[data-tuner-label]");
  const surfHost = tuner.querySelector<HTMLElement>("[data-surf]");
  const surfData = tuner.querySelector<HTMLScriptElement>("[data-surf-data]");
  const surf =
    !reduce && surfHost && surfData
      ? mountSurf(surfHost, JSON.parse(surfData.textContent ?? "[]") as SurfFrame[][], (text) => {
          if (label) label.textContent = text;
        })
      : null;
  surf?.show(0);
  let active = 0;
  const tune = (i: number) => {
    if (i === active) return;
    active = i;
    items.forEach((el, j) => el.classList.toggle("is-on", j === i));
    screens.forEach((el, j) => el.classList.toggle("is-on", j === i));
    if (label) label.textContent = items[i]?.dataset.tunerLabel ?? "";
    surf?.show(i);
  };
  // Scrolling tunes to the channel at the middle of the screen; while the pointer is on the names, hover leads.
  let pointing = false;
  const list = items[0]?.parentElement;
  list?.addEventListener("pointerenter", () => (pointing = true));
  list?.addEventListener("pointerleave", () => (pointing = false));
  items.forEach((el, i) => {
    el.addEventListener("pointerenter", () => tune(i));
    el.addEventListener("focusin", () => tune(i));
  });
  const io = new IntersectionObserver(
    (entries) => {
      if (pointing) return;
      for (const e of entries) if (e.isIntersecting) tune(items.indexOf(e.target as HTMLElement));
    },
    { rootMargin: "-45% 0px -45% 0px" },
  );
  items.forEach((el) => io.observe(el));
});

if (!reduce) {
  if (finePointer) {
    const { default: Lenis } = await import("lenis");
    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 0.95, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    const menu = document.getElementById("menu");
    new MutationObserver(() => (menu?.hasAttribute("open") ? lenis.stop() : lenis.start())).observe(menu ?? document.body, {
      attributes: true,
      attributeFilter: ["open"],
    });
    new MutationObserver(() =>
      document.documentElement.classList.contains("viewer-open") ? lenis.stop() : lenis.start(),
    ).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }

  /* Headings arrive as scrambled signal and settle into words. */
  document.querySelectorAll<HTMLElement>("[data-scramble]").forEach((el) => {
    const split = new SplitText(el, { type: "words", wordsClass: "word", aria: "none" });
    // Hold every word at its real width so the scramble glyphs never re-wrap the line.
    for (const w of split.words as HTMLElement[]) {
      w.style.display = "inline-block";
      w.style.width = `${w.getBoundingClientRect().width}px`;
      w.style.overflow = "hidden";
      w.style.verticalAlign = "bottom";
    }
    const play = () =>
      gsap.to(split.words, {
        duration: 1.1,
        stagger: 0.03,
        scrambleText: { text: "{original}", chars: "▯▮░▒", speed: 0.9 },
        onComplete: () => split.revert(),
      });
    if (el.dataset.scramble === "load") play();
    else ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: play });
  });

  /* Words start scattered across the line and gather into a paragraph as you scroll. */
  document.querySelectorAll<HTMLElement>("[data-gather]").forEach((el) => {
    const split = new SplitText(el, { type: "words", wordsClass: "word", aria: "none" });
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    gsap.from(split.words, {
      x: () => rand() * innerWidth * 0.18,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top 95%", end: "center 55%", scrub: 0.5 },
    });
  });

  /* The opening throws photographs where the pointer goes: a pool of ten, recycled, tilted. */
  document.querySelectorAll<HTMLElement>("[data-trail]").forEach((stage) => {
    const pool = [...stage.querySelectorAll<HTMLElement>("[data-trail-item]")];
    if (!pool.length) return;
    let next = 0;
    let z = 1;
    let lx = -999;
    let ly = -999;
    const throwAt = (x: number, y: number) => {
      const el = pool[next]!;
      next = (next + 1) % pool.length;
      el.style.zIndex = String(++z);
      gsap.killTweensOf(el);
      gsap.set(el, { x, y: y + 10, xPercent: -50, yPercent: -50, scale: 0.72, rotate: gsap.utils.random(-11, 11), autoAlpha: 1 });
      gsap.to(el, { y, scale: 1, duration: 0.3, ease: "back.out(2)" });
      gsap.to(el, { scale: 0, duration: 0.4, ease: "expo.in", delay: 1.6, onComplete: () => gsap.set(el, { autoAlpha: 0 }) });
    };
    if (finePointer) {
      stage.addEventListener("pointermove", (e) => {
        const r = stage.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        if (Math.hypot(x - lx, y - ly) < 150) return;
        lx = x;
        ly = y;
        throwAt(x, y);
      });
    } else {
      // No pointer to follow: the screen throws a frame every so often on its own while it is visible.
      let timer = 0;
      const tick = () => {
        const r = stage.getBoundingClientRect();
        throwAt(gsap.utils.random(r.width * 0.15, r.width * 0.85), gsap.utils.random(r.height * 0.3, r.height * 0.8));
      };
      new IntersectionObserver(([e]) => {
        clearInterval(timer);
        if (e?.isIntersecting) timer = window.setInterval(tick, 1100);
      }).observe(stage);
    }
  });

  /* Tossed prints: drag any card and throw it; it keeps its tilt and lands on top. */
  document.querySelectorAll<HTMLElement>("[data-toss]").forEach((table) => {
    let z = 10;
    const cards = [...table.querySelectorAll<HTMLElement>("[data-toss-card]")];
    gsap.from(cards, {
      y: 120,
      rotate: () => gsap.utils.random(-25, 25),
      opacity: 0,
      duration: 0.9,
      stagger: 0.06,
      ease: "back.out(1.4)",
      scrollTrigger: { trigger: table, start: "top 75%" },
    });
    if (!finePointer) return;
    cards.forEach((card) => {
      Draggable.create(card, {
        bounds: table,
        inertia: true,
        edgeResistance: 0.8,
        dragClickables: true,
        minimumMovement: 6,
        onPress() {
          card.style.zIndex = String(++z);
        },
        onDragStart() {
          card.classList.add("is-dragging");
        },
        onRelease() {
          card.classList.remove("is-dragging");
        },
      });
    });
  });

  /* Featured frames resolve from coarse pixels as they come into view. */
  document.querySelectorAll<HTMLElement>(".frame[data-crt]").forEach((frame) => {
    // A frame already on screen at load resolves on a timer; scrolling would leave it half-built.
    if (frame.getBoundingClientRect().top < innerHeight * 0.85) {
      developOnce(frame, 1600);
      return;
    }
    ScrollTrigger.create({
      trigger: frame,
      start: "top 130%",
      once: true,
      onEnter: () =>
        developOnScroll(frame, (draw) =>
          ScrollTrigger.create({ trigger: frame, start: "top 92%", end: "top 35%", onUpdate: (st) => draw(st.progress) }),
        ),
    });
  });

  addEventListener("load", () => ScrollTrigger.refresh());
}
