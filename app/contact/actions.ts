"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitContactForm(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { error: "All fields are required." };
  }

  try {
    // 1. Save to database
    const contact = await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
      },
    });

    // 2. Send email notification
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'WeDesign <onboarding@resend.dev>', // You can change this once you verify your domain
          to: 'jawad.pro17@gmail.com',
          subject: `New Contact Signal: ${name}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #333;">New Message Received</h2>
              <p><strong>From:</strong> ${name} (${email})</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap; color: #555;">${message}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #999;">Received via WeDesign Contact Form</p>
            </div>
          `,
        });
      } catch (mailError) {
        console.error("Email notification failed:", mailError);
        // We don't return error here because the message IS saved to the database
      }
    } else {
      console.warn("RESEND_API_KEY is missing. Skipping email notification.");
    }

    revalidatePath("/admin/contacts");
    return { success: true };
  } catch (error) {
    console.error("Contact form error:", error);
    return { error: "Something went wrong. Please try again later." };
  }
}
