/**
 * A corridor of photographs for the channel guide: prints stand side-on in a diagonal row, the page scroll
 * rides along them, and a slow swell runs through the row (faster when you scroll faster). Pointing at a
 * channel name loads that channel's frames into the corridor. Adapted from the "surf" carousel on
 * tlb.betteroff.studio; reimplemented here.
 */
import { gsap } from "gsap";

export interface SurfFrame {
  src: string;
  w: number;
  h: number;
  label: string;
  href: string;
}

interface Card {
  el: HTMLAnchorElement;
  img: HTMLImageElement;
  left: number;
  width: number;
  start: number;
  end: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function mountSurf(host: HTMLElement, channels: SurfFrame[][], onLabel: (text: string) => void) {
  const track = document.createElement("div");
  track.className = "surf__track";
  host.append(track);

  // A fixed run of cards, about three panel-widths long, so a card never wraps while it is on screen.
  const POOL = 54;
  const cards: Card[] = Array.from({ length: POOL }, () => {
    const el = document.createElement("a");
    el.className = "surf__card";
    el.tabIndex = -1;
    const img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    img.loading = "lazy";
    el.append(img);
    track.append(el);
    return { el, img, left: 0, width: 0, start: 0, end: 0 };
  });

  let active: SurfFrame[] = [];
  let ww = 0;
  let wh = 0;
  let span = 0;
  let target = 0;
  let pos = 0;
  let velocity = 0;
  let time = 0;
  const turn = { value: 0 };
  let visible = false;
  let raf = 0;
  let scrollAnchor = 0;

  const layout = () => {
    ww = host.clientWidth;
    wh = host.clientHeight;
    const step = ww / (ww < 640 ? 9 : 18);
    const cardW = Math.min(ww * 0.3, 20 * 16);
    cards.forEach((c, i) => {
      c.left = step * i;
      c.width = cardW;
      c.start = c.left - cardW - ww;
      c.end = c.left + cardW * 2;
      c.el.style.width = `${cardW}px`;
    });
    span = active.length ? step * active.length : 1;
  };

  // Where a card sits in its pass across the panel: 0 entering on the right, 1 leaving on the left.
  const progressOf = (c: Card, x: number) => {
    if (x <= c.start || x >= c.end) return { inside: false, p: 0 };
    return { inside: true, p: 1 - gsap.utils.clamp(0, 1, 1 + (x - c.left - c.width) / (ww + c.width)) };
  };

  const render = () => {
    const wrap = gsap.utils.wrap(0, span);
    for (let i = 0; i < active.length; i++) {
      const c = cards[i]!;
      const x = c.left + wrap(pos - c.left + span / 2) - span / 2;
      const { inside, p } = progressOf(c, x);
      if (!inside) {
        c.el.style.visibility = "hidden";
        continue;
      }
      const q = 1 - p;
      const centred = q - 0.5;
      const swell = Math.sin(time + centred * Math.PI * 2) * wh * 0.035 * (1 + Math.min(Math.abs(velocity), 80) * 0.01);
      const y = wh * 0.5 * centred + swell;
      const rot = (-(15 * q) - 70) * turn.value;
      c.el.style.visibility = "visible";
      c.el.style.transform = `translate3d(${(c.left - x).toFixed(1)}px, ${y.toFixed(1)}px, 0) perspective(700px) rotateY(${rot.toFixed(2)}deg)`;
    }
  };

  const tick = () => {
    raf = 0;
    if (!visible) return;
    pos = lerp(pos, target, 0.1);
    velocity = pos - target;
    time += 0.02;
    render();
    raf = requestAnimationFrame(tick);
  };
  const start = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const show = (index: number) => {
    const frames = channels[index] ?? [];
    // Short channels repeat their frames to fill the run.
    active = frames.length ? Array.from({ length: POOL }, (_, i) => frames[i % frames.length]!) : [];
    cards.forEach((c, i) => {
      const f = active[i];
      c.el.hidden = !f;
      if (!f) return;
      if (c.img.getAttribute("src") !== f.src) {
        c.img.src = f.src;
        c.img.width = f.w;
        c.img.height = f.h;
      }
      c.el.href = f.href;
      c.el.dataset.label = f.label;
    });
    layout();
    // Each channel enters flat and swings into the corridor.
    turn.value = 0;
    gsap.to(turn, { value: 1, duration: 1, ease: "expo.out" });
    render();
  };

  track.addEventListener("pointerover", (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>(".surf__card");
    if (card?.dataset.label) onLabel(card.dataset.label);
  });

  // The page scroll is the ride: every pixel scrolled moves the row on by 1.6 pixels.
  addEventListener(
    "scroll",
    () => {
      target = (scrollY - scrollAnchor) * 1.6;
    },
    { passive: true },
  );

  new ResizeObserver(() => {
    layout();
    render();
  }).observe(host);
  new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting;
    if (visible) start();
  }).observe(host);

  scrollAnchor = host.getBoundingClientRect().top + scrollY;
  host.classList.add("is-surfing");
  return { show };
}
