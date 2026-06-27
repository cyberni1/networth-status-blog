import type { Metadata, Viewport } from "next";
import ChatRoom from "./ChatRoom";

export const metadata: Metadata = {
  title: "KI REVOLUTION – Live Sprach- & Text-Chat",
  description:
    "KI REVOLUTION: Tritt mit deinem Nickname bei. Tippe mit allen, höre den Live-Voice-Chat und sprich, sobald der Admin dich freischaltet.",
  icons: { icon: "/ki-revolution.svg" },
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
