import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: "/", priority: 1 },
    { path: "/signin", priority: 0.5 },
    { path: "/signup", priority: 0.5 },
  ];

  return staticPages.map(({ path, priority }) => ({
    url: `${process.env.APP_URL ?? "http://localhost:3000"}${path}`,
    priority,
    lastModified: new Date(),
  }));
}
