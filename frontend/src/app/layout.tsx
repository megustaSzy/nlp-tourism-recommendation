import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Chatbot from "../components/Chatbot";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LUMIARA - Smart Tourism Village Lampung",
  description: "Temukan destinasi wisata di Lampung secara cepat dan relevan menggunakan pencarian pintar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-50 font-sans relative">
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
