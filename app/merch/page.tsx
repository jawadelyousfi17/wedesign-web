import React from "react";
import { prisma } from "@/lib/prisma";
import MerchClient from "./merch-client";

export default async function MerchPage() {
  const items = await prisma.merchItem.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return <MerchClient items={items} />;
}
