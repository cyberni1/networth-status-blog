"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Beitrag wirklich l\u00f6schen?")) return;

    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Fehler beim L\u00f6schen des Beitrags.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
      title="L\u00f6schen"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
