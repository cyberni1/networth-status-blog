import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NETWORTH STATUS - Vermögen der Reichen & Berühmten",
  description: "Entdecke das Vermögen der reichsten Menschen der Welt. Von Tech-Milliardären bis zu Entertainment-Stars - alle aktuellen Zahlen, Erfolgsgeschichten und Hintergründe.",
  keywords: "Vermögen, Reiche, Berühmte, Milliardäre, Elon Musk, Jeff Bezos, Cristiano Ronaldo, Net Worth, Wealth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
