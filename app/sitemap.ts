import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://wedesign.club'

  // Get dynamic slugs
  const articles = await prisma.article.findMany({ select: { slug: true, updatedAt: true } })
  const merch = await prisma.merchItem.findMany({ select: { slug: true, updatedAt: true } })
  const events = await prisma.calendarEvent.findMany({ select: { id: true, updatedAt: true } })

  const articleUrls = articles.map((a) => ({
    url: `${baseUrl}/journal/${a.slug}`,
    lastModified: a.updatedAt,
  }))

  const merchUrls = merch.map((m) => ({
    url: `${baseUrl}/merch/${m.slug}`,
    lastModified: m.updatedAt,
  }))

  const eventUrls = events.map((e) => ({
    url: `${baseUrl}/calendar/${e.id}`,
    lastModified: e.updatedAt,
  }))

  const routes = ['', '/journal', '/merch', '/calendar', '/projects', '/team', '/services', '/contact'].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
    })
  )

  return [...routes, ...articleUrls, ...merchUrls, ...eventUrls]
}
