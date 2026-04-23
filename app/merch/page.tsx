import React from "react";
import { prisma } from "@/lib/prisma";
import MerchClient from "./merch-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supply",
  description: "Limited edition club gear designed for the terminal. High-quality essentials for the modern creator.",
};

export default async function MerchPage() {
  const items = await prisma.merchItem.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return <MerchClient items={items} />;
}
