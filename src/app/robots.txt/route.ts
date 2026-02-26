import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/api/',
        disallow: '/success',
      },
    ],
    sitemap: 'https://supertoolz.xyz/sitemap.xml',
  }
}
