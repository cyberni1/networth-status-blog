import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "Networth Status – Das Vermögen der Reichen & Berühmten",
    template: "%s | Networth Status",
  },
  description:
    "Entdecke das Nettovermögen von Künstlern, Sportlern, Unternehmern und Influencern. Aktuelle Zahlen, Hintergründe und Analysen.",
  keywords: ["Nettovermögen", "Prominente", "Reiche", "Berühmte", "Künstler", "Sportler", "Unternehmer", "Influencer"],
  authors: [{ name: "Networth Status" }],
  creator: "Networth Status",
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://networth-status-blog.vercel.app",
    siteName: "Networth Status",
    title: "Networth Status – Das Vermögen der Reichen & Berühmten",
    description:
      "Entdecke das Nettovermögen von Künstlern, Sportlern, Unternehmern und Influencern.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Networth Status",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Networth Status – Das Vermögen der Reichen & Berühmten",
    description:
      "Entdecke das Nettovermögen von Künstlern, Sportlern, Unternehmern und Influencern.",
    images: ["/og-image.png"],
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
