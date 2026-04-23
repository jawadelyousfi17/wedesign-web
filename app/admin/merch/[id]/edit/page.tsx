import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditMerchForm from "./EditMerchForm";

export default async function EditMerchPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const { id } = await params;

  const item = await prisma.merchItem.findUnique({
    where: { id }
  });

  if (!item) {
    notFound();
  }

  return <EditMerchForm item={item} />;
}
