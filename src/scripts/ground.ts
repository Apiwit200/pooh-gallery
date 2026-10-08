/** Any element with data-ground sets the page ground while it holds the middle of the viewport. */
const root = document.documentElement;
const zones = document.querySelectorAll<HTMLElement>("[data-ground-zone]");
if (zones.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) root.dataset.ground = (e.target as HTMLElement).dataset.groundZone;
    },
    { rootMargin: "-50% 0px -50% 0px" },
  );
  zones.forEach((z) => io.observe(z));
}
