"use server";

import { prisma } from "@/lib/prisma";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function placeMerchOrder(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const size = formData.get("size") as string;
  const color = formData.get("color") as string;
  const customerName = formData.get("name") as string;
  const customerAddress = formData.get("address") as string;
  const customerPhone = formData.get("phone") as string;

  if (!itemId || !customerName || !customerAddress || !customerPhone) {
    return { error: "Missing required fields." };
  }

  try {
    const item = await prisma.merchItem.findUnique({
      where: { id: itemId }
    });

    if (!item) return { error: "Item not found." };

    const order = await prisma.merchOrder.create({
      data: {
        itemId,
        size,
        color,
        customerName,
        customerAddress,
        customerPhone,
      },
    });

    // Email notification
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'WeDesign Supply <onboarding@resend.dev>',
          to: 'jawad.pro17@gmail.com',
          subject: `New Merch Order: ${item.title}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #000; border-radius: 0;">
              <h2 style="text-transform: uppercase; letter-spacing: 2px;">Incoming Order Request</h2>
              <p><strong>Item:</strong> ${item.title}</p>
              <p><strong>Variant:</strong> ${size || 'N/A'} / ${color || 'N/A'}</p>
              <hr style="border: 0; border-top: 2px solid #000; margin: 20px 0;" />
              <p><strong>Customer:</strong> ${customerName}</p>
              <p><strong>Phone:</strong> ${customerPhone}</p>
              <p><strong>Address:</strong> ${customerAddress}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 10px; text-transform: uppercase; color: #999;">Order ID: ${order.id}</p>
            </div>
          `,
        });
      } catch (e) {
        console.error("Order email failed:", e);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Order error:", error);
    return { error: "Failed to place order." };
  }
}
