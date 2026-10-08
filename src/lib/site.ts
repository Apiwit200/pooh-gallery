export const site = {
  title: "Light Falls",
  photographer: "Apiwit Nathong",
  description:
    "Photographs by Apiwit Nathong, arranged as one descent through light: from noon on the roads of Thailand and Taiwan down to the Moon, Orion and Andromeda.",
  locale: "en",
  // Fill these in to show them on the About and Contact pages. Leave empty to hide.
  // A short statement in the photographer's own words, one paragraph per entry.
  statement: [] as string[],
  email: "",
  links: [] as { label: string; href: string }[],
};

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const url = (path = "/") => `${base}${path.startsWith("/") ? path : `/${path}`}`;
