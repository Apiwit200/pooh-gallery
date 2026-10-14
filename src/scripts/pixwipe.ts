import { gsap } from "gsap";

/**
 * Page change as a field of pixels: on an internal link the cells snap on in random order, the next page
 * opens covered, and its cells snap off. The browser still does a normal navigation underneath.
 */
const host = document.querySelector<HTMLElement>("[data-pixwipe]");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;

function cells() {
  if (!host) return [];
  const cols = innerWidth < 700 ? 8 : 16;
  const rows = Math.ceil((innerHeight / innerWidth) * cols);
  host.style.setProperty("--cols", String(cols));
  host.replaceChildren(...Array.from({ length: cols * rows }, () => document.createElement("i")));
  return [...host.children] as HTMLElement[];
}

if (host && !reduce) {
  if (root.classList.contains("wipe-in")) {
    const list = cells();
    gsap.set(list, { opacity: 1 });
    host.style.background = "transparent";
    root.classList.remove("wipe-in");
    gsap.to(list, { opacity: 0, duration: 0.01, stagger: { each: 0.012, from: "random" }, delay: 0.05, onComplete: () => host.replaceChildren() });
  }
  try {
    sessionStorage.removeItem("pixwipe");
  } catch {
    /* storage unavailable: the wipe simply does not carry over */
  }

  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === "_blank" || a.hasAttribute("download") || a.dataset.pswpWidth) return;
    const to = new URL(a.href, location.href);
    if (to.origin !== location.origin || (to.pathname === location.pathname && to.hash)) return;
    e.preventDefault();
    const list = cells();
    try {
      sessionStorage.setItem("pixwipe", "1");
    } catch {
      /* fine: the next page just opens without its half of the wipe */
    }
    gsap.to(list, {
      opacity: 1,
      duration: 0.01,
      stagger: { each: 0.008, from: "random" },
      onComplete: () => location.assign(to.href),
    });
  });

  // Coming back through the history cache must not leave the screen covered.
  addEventListener("pageshow", (e) => {
    if (e.persisted) host.replaceChildren();
  });
}
