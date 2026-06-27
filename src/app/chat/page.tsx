import type { Metadata, Viewport } from "next";
import ChatRoom from "./ChatRoom";

export const metadata: Metadata = {
  title: "Live-Raum – Sprach- & Text-Chat",
  description:
    "Tritt mit deinem Nickname dem Live-Raum bei. Tippe mit allen, höre den Voice-Chat und sprich, sobald der Admin dich freischaltet.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0b0b14",
};

export default function ChatPage() {
  return <ChatRoom />;
}
