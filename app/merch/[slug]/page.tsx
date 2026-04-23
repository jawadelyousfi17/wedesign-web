import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ItemClient from "./ItemClient";

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
