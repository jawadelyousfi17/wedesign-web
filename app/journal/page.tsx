import { prisma } from "@/lib/prisma";
import JournalClient from "./journal-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Notebook",
  description: "Insights, experiments, and stories from the WeDesign crew. Talking design, code, and everything in between.",
};

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
