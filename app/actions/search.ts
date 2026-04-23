"use server";

import { prisma } from "@/lib/prisma";

export async function searchEverything(query: string) {
  if (!query || query.length < 2) return [];

  const [projects, articles, merch] = await Promise.all([
    prisma.project.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 3,
    }),
    prisma.article.findMany({
      where: {
        publishedAt: { not: null },
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 3,
    }),
    prisma.merchItem.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 3,
    }),
  ]);

  const results = [
    ...projects.map(p => ({ id: p.id, title: p.title, type: 'project' as const, href: `/projects` })), // Linking to main projects page for now as there's no single project page yet
    ...articles.map(a => ({ id: a.id, title: a.title, type: 'article' as const, href: `/journal/${a.slug}` })),
    ...merch.map(m => ({ id: m.id, title: m.title, type: 'merch' as const, href: `/merch/${m.slug}` })),
  ];

  return results;
}
