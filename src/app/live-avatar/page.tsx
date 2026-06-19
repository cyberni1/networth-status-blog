import LiveAvatar from "@/components/LiveAvatar";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Live Avatar",
	description:
		"Animierter Sprecher-Avatar mit Mikrofon-Lippensynchronisation für Livestreams.",
	robots: { index: false, follow: false },
};

export default function LiveAvatarPage() {
	return <LiveAvatar />;
}
