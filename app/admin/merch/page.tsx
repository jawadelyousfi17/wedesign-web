import { prisma } from "@/lib/prisma";
import MerchAdminClient from "./MerchAdminClient";

export default async function AdminMerchPage() {
  const items = await prisma.merchItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  const orders = await prisma.merchOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { item: true },
  });

  return <MerchAdminClient items={items} orders={orders} />;
}
