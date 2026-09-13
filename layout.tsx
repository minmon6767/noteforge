import type { Metadata } from "next";
import { Lora, Space_Grotesk } from "next/font/google";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NoteForge | AI Student Workspace",
  description: "Turn your lecture PDFs into focused revision notes and quizzes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased min-h-screen font-sans text-stone-800 bg-paper">
        {children}
      </body>
    </html>
  );
}
