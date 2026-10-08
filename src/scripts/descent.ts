import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;

if (!reduce) {
  gsap.registerPlugin(ScrollTrigger);

  if (finePointer) {
    const { default: Lenis } = await import("lenis");
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.getElementById("menu")?.addEventListener("close", () => lenis.start());
    document.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest("[data-menu-open], a[data-pswp-width]")) lenis.stop();
    });
    document.addEventListener("pswp-closed", () => lenis.start());
  }

  // Type moves on its own layer, against the photographs.
  gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
    const k = Number(el.dataset.parallax);
    gsap.to(el, {
      yPercent: k * 100,
      ease: "none",
      scrollTrigger: { trigger: el.closest("section") ?? el, start: "top top", end: "bottom top", scrub: true },
    });
  });

  // Each composition reveals in its own way; the shape follows the layout.
  const reveal: Record<string, (el: HTMLElement) => gsap.core.Timeline | gsap.core.Tween | void> = {
    full: (el) =>
      gsap.fromTo(
        el.querySelector(".frame"),
        { clipPath: "inset(14% 6% 14% 6%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: el, start: "top 95%", end: "top 25%", scrub: 0.6 } },
      ),
    offset: (el) => {
      const fromRight = el.classList.contains("block--right");
      return gsap.fromTo(
        el.querySelector(".frame"),
        { clipPath: fromRight ? "inset(0% 0% 0% 38%)" : "inset(0% 38% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: el, start: "top 92%", end: "top 38%", scrub: 0.6 } },
      );
    },
    pair: (el) =>
      gsap.from(el.querySelectorAll(".frame"), {
        yPercent: (i) => (i ? 18 : 6),
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom 60%", scrub: 0.8 },
      }),
    quiet: (el) =>
      gsap.from(el.querySelector(".frame"), {
        opacity: 0.25,
        scale: 0.92,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "center center", scrub: 0.8 },
      }),
  };
  document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => reveal[el.dataset.reveal!]?.(el));

  // Runs of landscapes become a filmstrip that scrolls sideways while the page holds still.
  gsap.matchMedia().add("(min-width: 48rem)", () => {
    {
      document.querySelectorAll<HTMLElement>("[data-strip]").forEach((strip) => {
        const track = strip.querySelector<HTMLElement>("[data-strip-track]")!;
        strip.style.overflow = "visible";
        const distance = () => Math.max(0, track.scrollWidth - strip.clientWidth);
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: strip,
            start: "center center",
            end: () => `+=${distance()}`,
            pin: strip.closest(".block") ?? strip,
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        });
      });
    }
    return () => document.querySelectorAll<HTMLElement>("[data-strip]").forEach((s) => (s.style.overflow = ""));
  });

  addEventListener("load", () => ScrollTrigger.refresh());
}
