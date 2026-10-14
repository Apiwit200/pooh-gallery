export const site = {
  title: "Light Falls",
  photographer: "Apiwit Nathong",
  description:
    "Photographs by Apiwit Nathong, played like late-night television: channels of roads, zoos, cafés, beaches and temples in Thailand and Taiwan, and the deep sky above them.",
  locale: "en",
  // Fill these in to show them on the About and Contact pages. Leave empty to hide.
  // A short statement in the photographer's own words, one paragraph per entry.
  statement: [] as string[],
  email: "",
  links: [] as { label: string; href: string }[],
};

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const url = (path = "/") => `${base}${path.startsWith("/") ? path : `/${path}`}`;
