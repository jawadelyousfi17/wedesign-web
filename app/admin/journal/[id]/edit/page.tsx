import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditArticleClient from "./edit-client";

interface EditArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) {
    notFound();
  }

  return <EditArticleClient article={article} />;
}
