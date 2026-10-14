/**
 * Cuts a hole in the CRT layer over the photograph under the pointer, so the one you look at plays
 * clean. The hole follows that frame while the page scrolls, and closes when the pointer leaves.
 */
const root = document.documentElement;
let current: HTMLElement | null = null;
let raf = 0;

const place = () => {
  raf = 0;
  if (!current) return;
  const r = current.getBoundingClientRect();
  root.style.setProperty("--hole-x", `${r.left}px`);
  root.style.setProperty("--hole-y", `${r.top}px`);
  root.style.setProperty("--hole-w", `${r.width}px`);
  root.style.setProperty("--hole-h", `${r.height}px`);
};
const schedule = () => {
  if (!raf) raf = requestAnimationFrame(place);
};

const look = (frame: HTMLElement | null) => {
  if (frame === current) return;
  current?.classList.remove("is-looked-at");
  current = frame;
  if (!frame) {
    root.style.removeProperty("--hole-x");
    root.style.removeProperty("--hole-y");
    root.style.removeProperty("--hole-w");
    root.style.removeProperty("--hole-h");
    return;
  }
  frame.classList.add("is-looked-at");
  place();
};

if (matchMedia("(hover: hover)").matches) {
  document.addEventListener("pointerover", (e) => look((e.target as HTMLElement).closest<HTMLElement>(".frame")));
  document.addEventListener("pointerleave", () => look(null));
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
}
// A frame that has keyboard focus is being looked at too.
document.addEventListener("focusin", (e) => look((e.target as HTMLElement).closest<HTMLElement>(".frame")));
