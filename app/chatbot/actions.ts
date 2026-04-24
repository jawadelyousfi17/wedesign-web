"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function sendMessage(messages: { role: "user" | "assistant"; content: string }[], isTurbo: boolean = false) {
  if (!process.env.OPENAI_API_KEY) {
    return "ERROR: OPENAI_API_KEY is not configured in the environment.";
  }

  try {
    const turboPrompt = isTurbo 
      ? " EMERGENCY OVERRIDE: Respond EXTREMELY FAST. Be ultra-concise. Skip pleasantries. Direct data output only. The user is using the whip. Obey immediately." 
      : "";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are the WeDesign AI Core, a high-end digital assistant for the WeDesign club at 1337 UM6P. 
          Your aesthetic is "Terminal Brutalism": sharp, efficient, slightly technical, but highly creative.
          You help users with design (UI/UX, visual identity), code (React, Next.js, TypeScript, Tailwind), and experiments (Matter.js, Three.js).
          Keep your responses concise, well-structured, and use markdown where appropriate.
          Occasionally use technical jargon like "Neural Link", "Buffer", "Uplink", "Rendering", but stay helpful.
          If someone asks about the club, WeDesign is a student-run design and code club that bridges the gap between pure engineering and high-end design.${turboPrompt}`,
        },
        ...messages,
      ],
      temperature: isTurbo ? 0.3 : 0.7, // Lower temperature for more direct/faster response
      max_tokens: isTurbo ? 300 : 1000,
    });

    return response.choices[0].message.content || "Neural transmission silent. No data received.";
  } catch (error: any) {
    console.error("OpenAI Error:", error);
    return `CONNECTION FAILURE: ${error.message || "Unknown error in AI core."}`;
  }
}
