import React from "react";
import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description: "Project idea, collab, question, or just want to talk type. Get in touch with the WeDesign crew.",
};

export default function ContactPage() {
  return <ContactClient />;
}
