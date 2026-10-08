import type PhotoSwipeLightbox from "photoswipe/lightbox";

let lightbox: PhotoSwipeLightbox | null = null;

/** One slide per photograph, even when a frame appears both in a curated sequence and in the full grid. */
const anchors = () => {
  const seen = new Set<string>();
  return [...document.querySelectorAll<HTMLAnchorElement>("a[data-pswp-width]")].filter((a) => {
    const id = a.dataset.pid ?? a.href;
    return seen.has(id) ? false : (seen.add(id), true);
  });
};
const indexOf = (pid?: string) => anchors().findIndex((a) => a.dataset.pid === pid);

async function setup() {
  if (lightbox || !anchors().length) return lightbox;
  const [{ default: Lightbox }] = await Promise.all([import("photoswipe/lightbox")]);
  lightbox = new Lightbox({
    dataSource: anchors().map((a) => ({
      src: a.href,
      width: Number(a.dataset.pswpWidth),
      height: Number(a.dataset.pswpHeight),
      alt: a.querySelector("img")?.alt ?? "",
      msrc: a.querySelector("img")?.currentSrc,
      element: a,
      pid: a.dataset.pid,
      caption: a.dataset.caption,
    })),
    pswpModule: () => import("photoswipe"),
    bgOpacity: 1,
    showHideAnimationType: "zoom",
    imageClickAction: "zoom",
    tapAction: "toggle-controls",
    wheelToZoom: true,
    preloaderDelay: 400,
    closeTitle: "Close (Esc)",
    zoomTitle: "Zoom",
    arrowPrevTitle: "Previous photograph",
    arrowNextTitle: "Next photograph",
    errorMsg: "This photograph could not be loaded.",
    paddingFn: (vp) => (vp.x < 700 ? { top: 0, bottom: 0, left: 0, right: 0 } : { top: 48, bottom: 72, left: 64, right: 64 }),
  });
  lightbox.on("uiRegister", () => {
    lightbox!.pswp!.ui!.registerElement({
      name: "facts",
      order: 9,
      isButton: false,
      appendTo: "root",
      html: "",
      onInit: (el, pswp) => {
        el.className = "pswp__facts mono";
        el.setAttribute("aria-live", "polite");
        const update = () => {
          const d = pswp.currSlide?.data as { caption?: string } | undefined;
          el.textContent = d?.caption ?? "";
        };
        pswp.on("change", update);
        update();
      },
    });
  });
  lightbox.on("change", () => {
    const pid = (lightbox!.pswp?.currSlide?.data as { pid?: string } | undefined)?.pid;
    if (pid) history.replaceState(history.state, "", `#p=${pid}`);
  });
  lightbox.on("close", () => {
    history.replaceState(history.state, "", location.pathname + location.search);
    document.dispatchEvent(new Event("pswp-closed"));
  });
  lightbox.init();
  return lightbox;
}

document.addEventListener("click", async (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-pswp-width]");
  if (!a) return;
  e.preventDefault();
  const lb = await setup();
  lb?.loadAndOpen(Math.max(0, indexOf(a.dataset.pid)));
});

const deep = location.hash.match(/^#p=([\w-]+)/)?.[1];
if (deep) {
  const index = indexOf(deep);
  if (index >= 0) setup().then((lb) => lb?.loadAndOpen(index));
}
