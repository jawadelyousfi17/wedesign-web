import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Cardo } from "next/font/google";
import "./globals.css";
import "./styles.css";
import { Navbar } from "@/components/main/Navbar";
import Footer from "@/components/main/Footer";
import { CommandPalette } from "@/components/main/CommandPalette";
import HandMouseProvider from "@/components/hand-mouse-provider";
import DigitalWhip from "@/components/main/DigitalWhip";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const cardo = Cardo({
  weight: "400",
  variable: "--font-cardo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WeDesign | 1337 UM6P",
    template: "%s | WeDesign"
  },
  description: "A student-run design and code club at 1337 UM6P. We build high-end digital products, experiments, and aesthetics at the intersection of design and the terminal.",
  keywords: ["Design", "Code", "1337", "UM6P", "Web Development", "UI/UX", "Morocco", "Student Club"],
  authors: [{ name: "WeDesign Crew" }],
  creator: "WeDesign",
  metadataBase: new URL("https://wedesign.club"), // Replace with your actual domain
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wedesign.club",
    siteName: "WeDesign",
    title: "WeDesign | Design & Code Club at 1337 UM6P",
    description: "Bridging the gap between pure engineering and high-end design. Shipping high-fidelity interfaces and robust code.",
    images: [
      {
        url: "/og-image.jpg", // Make sure to add this image to your public folder
        width: 1200,
        height: 630,
        alt: "WeDesign Club",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WeDesign | 1337 UM6P",
    description: "A student-run design and code club at 1337 UM6P.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico", // Ideally use a proper apple-touch-icon.png
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={` ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${cardo.variable} h-full antialiased`}
    >
      <body>
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
          {/* <DigitalWhip /> */}
          <HandMouseProvider/>
          <Navbar />
          <CommandPalette />
          <main className="flex-1 max-w-7xl mx-auto w-full">
            {children}
          </main>
          <div className="max-w-7xl mx-auto w-full">
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
