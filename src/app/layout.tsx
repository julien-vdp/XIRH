import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Julien Favaux — Consultant Indépendant SIRH & Automatisation",
  description: "Consultant SIRH Indépendant. Accompagnement sur projets SIRH, implémentation de Core HR, automatisation de données RH, SuccessFactors et Formation.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body style={{ margin: 0, padding: 0, minHeight: '100%' }}>
        {children}
      </body>
    </html>
  );
}
