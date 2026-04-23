import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ItemClient from "./ItemClient";
import { Metadata } from "next";

export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await prisma.merchItem.findUnique({
    where: { slug }
  });

  if (!item) return { title: "Item Not Found" };

  return {
    title: item.title,
    description: item.description || `Purchase ${item.title} from WeDesign Supply.`,
    openGraph: {
      title: `${item.title} | WeDesign Supply`,
      description: item.description || `Purchase ${item.title} from WeDesign Supply.`,
      images: item.images[0] ? [{ url: item.images[0] }] : [],
    },
  };
}

export async function generateStaticParams() {
  const items = await prisma.merchItem.findMany({
    select: { slug: true },
  });
  return items.map((item) => ({
    slug: item.slug,
  }));
}

export default async function MerchItemPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const { slug } = await params;

  const item = await prisma.merchItem.findUnique({
    where: { slug }
  });

  if (!item) {
    notFound();
  }

  return <ItemClient item={item} />;
}
