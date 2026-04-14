import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

const SITE_URL = "https://networth-status-blog.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Networth Status – Das Vermögen der Reichen & Berühmten",
    template: "%s | Networth Status",
  },
  description:
    "Entdecke das aktuelle Nettovermögen deiner Lieblingsstars. Alle Zahlen zu Künstlern, Sportlern, Unternehmern & Influencern – fundiert, aktuell und auf Deutsch.",
  keywords: [
    "Nettovermögen", "Net Worth", "Promi Vermögen", "Gehalt Stars",
    "Wie reich ist", "Reichste Menschen", "Milliardäre", "Prominente Vermögen",
    "Künstler Nettovermögen", "Sportler Gehalt", "Unternehmer Vermögen",
    "Influencer Einkommen", "Forbes Liste Deutschland", "Bloomberg Milliardäre",
  ],
  authors: [{ name: "Networth Status Redaktion" }],
  creator: "Networth Status",
  publisher: "Networth Status",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: SITE_URL,
    siteName: "Networth Status",
    title: "Networth Status – Das Vermögen der Reichen & Berühmten",
    description:
      "Entdecke das aktuelle Nettovermögen deiner Lieblingsstars. Fundierte Analysen zu Künstlern, Sportlern, Unternehmern & Influencern.",
    images: [
      {
        url: `${SITE_URL}/api/og?title=Networth+Status&category=UNTERNEHMER`,
        width: 1200,
        height: 630,
        alt: "Networth Status – Das Vermögen der Reichen & Berühmten",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Networth Status – Das Vermögen der Reichen & Berühmten",
    description:
      "Entdecke das aktuelle Nettovermögen deiner Lieblingsstars. Fundierte Analysen zu Künstlern, Sportlern, Unternehmern & Influencern.",
    images: [`${SITE_URL}/api/og?title=Networth+Status&category=UNTERNEHMER`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: undefined, // Add Google Search Console verification ID here when available
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {/* WCAG 2.1: Skip navigation links */}
        <a href="#main-content" className="skip-link">Zum Hauptinhalt springen</a>
        <a href="#search-input" className="skip-link">Zur Suche springen</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
