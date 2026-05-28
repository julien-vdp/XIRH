import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service des Encombrants — Choisy-le-Roi",
  description: "Planifiez vos collectes d'encombrants à domicile, suivez vos demandes de ramassage et consultez les consignes de tri de la Mairie de Choisy-le-Roi.",
  openGraph: {
    title: "Service des Encombrants — Ville de Choisy-le-Roi",
    description: "Plateforme écocitoyenne de gestion et planification des retraits d'encombrants pour la Ville de Choisy-le-Roi.",
    url: "https://www.xirh.fr/encombrants",
    siteName: "Service Encombrants Choisy-le-Roi",
    images: [
      {
        url: "https://www.xirh.fr/encombrant-logo.png",
        width: 512,
        height: 512,
        alt: "Logo Service Encombrants Choisy-le-Roi",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Service des Encombrants — Ville de Choisy-le-Roi",
    description: "Plateforme écocitoyenne de gestion et planification des retraits d'encombrants pour la Ville de Choisy-le-Roi.",
    images: ["https://www.xirh.fr/encombrant-logo.png"],
  },
};

export default function EncombrantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
