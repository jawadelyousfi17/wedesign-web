import { prisma } from "@/lib/prisma";
import JournalClient from "./journal-client";

export default async function JournalPage() {
  const articles = await prisma.article.findMany({
    where: {
      publishedAt: {
        not: null,
      },
    },
    include: {
      author: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  return <JournalClient initialArticles={articles} />;
}
