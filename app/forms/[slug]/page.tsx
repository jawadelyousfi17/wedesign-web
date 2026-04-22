import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FormClient from "./form-client";

interface FormPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function FormPage({ params }: FormPageProps) {
  const { slug } = await params;

  const form = await prisma.form.findUnique({
    where: { slug, isActive: true },
  });

  if (!form) {
    notFound();
  }

  return <FormClient form={form} />;
}
