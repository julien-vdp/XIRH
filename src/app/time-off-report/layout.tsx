import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Time Off Control | XIRH',
  description: 'Générez localement un rapport de contrôle SAP SuccessFactors Time Off à partir de vos exports, sans transmission ni conservation de données salariés.',
  openGraph: {
    title: 'Time Off Control | XIRH',
    description: 'Vos compteurs SAP SuccessFactors, sous contrôle — en local et en toute confidentialité.',
    url: 'https://www.xirh.fr/time-off-report',
    siteName: 'XIRH',
    locale: 'fr_FR',
    type: 'website',
    images: [{ url: 'https://www.xirh.fr/time-off-report-warm.png', width: 1672, height: 936, alt: 'Documents SAP Time Off réunis dans un rapport de contrôle' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Time Off Control | XIRH',
    description: 'Un rapport Time Off local, fiable et confidentiel.',
    images: ['https://www.xirh.fr/time-off-report-warm.png'],
  },
};

export default function TimeOffReportLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
