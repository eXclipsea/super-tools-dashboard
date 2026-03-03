import { MetadataRoute } from 'next';

const BASE_URL = 'https://supertoolz.xyz';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/quickreceipt', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/habitrise', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/dinedecide', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/packlight', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/voicetask', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/kitchen-commander', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/argument-settler', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/formalize', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/personasync', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/spaceclear', priority: 0.8, changeFrequency: 'monthly' as const },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
