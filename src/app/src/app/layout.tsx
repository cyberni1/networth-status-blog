import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NETWORTH STATUS - Vermögen der Reichen & Berühmten",
  description: "Entdecke das Vermögen der reichsten Menschen der Welt. Von Tech-Milliardären bis zu Entertainment-Stars - alle aktuellen Zahlen, Erfolgsgeschichten und Hintergründe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
