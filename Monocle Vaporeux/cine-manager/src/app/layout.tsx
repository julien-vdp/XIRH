import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  weight: "400",
  variable: "--font-title",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XInéma - Management & Programmation",
  description: "Système de gestion et planification de cinéma",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${bebas.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col dark" suppressHydrationWarning>{children}</body>
    </html>
  );
}
