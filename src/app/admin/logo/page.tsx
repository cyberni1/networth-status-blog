"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function LogoUploadPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDone(false);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const upload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setDone(false);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/site-logo", { method: "POST", body: fd });

    if (res.ok) {
      setDone(true);
    } else {
      alert("Fehler beim Hochladen");
    }
    setUploading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 16px" }}>
      <Link href="/admin" style={{ color: "#c084fc", textDecoration: "none", fontSize: 14 }}>
        ← Zurück zum Admin
      </Link>

      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "24px 0 8px" }}>
        Logo hochladen
      </h1>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginBottom: 32 }}>
        Das Logo wird in der Navbar und als Favicon angezeigt.
      </p>

      {/* Aktuelles Logo */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        textAlign: "center",
      }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
          Aktuelles Logo
        </p>
        <div style={{ background: "rgba(8,8,16,0.9)", borderRadius: 12, padding: "16px 24px", display: "inline-block" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview || `/api/site-logo?t=${Date.now()}`}
            alt="Logo"
            style={{ height: 60, width: "auto", objectFit: "contain" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      </div>

      {/* Upload */}
      <div style={{
        background: "rgba(168,85,247,0.06)",
        border: "2px dashed rgba(168,85,247,0.3)",
        borderRadius: 16,
        padding: 32,
        textAlign: "center",
      }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFile}
          style={{ display: "none" }}
          id="logo-file"
        />
        <label
          htmlFor="logo-file"
          style={{
            display: "inline-block",
            padding: "12px 28px",
            borderRadius: 10,
            background: "rgba(168,85,247,0.15)",
            border: "1px solid rgba(168,85,247,0.4)",
            color: "#c084fc",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          Bild auswählen
        </label>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
          PNG, JPG oder WebP — max 5 MB
        </p>
      </div>

      {preview && (
        <button
          onClick={upload}
          disabled={uploading}
          style={{
            width: "100%",
            marginTop: 20,
            padding: "14px 0",
            borderRadius: 12,
            border: "none",
            fontSize: 16,
            fontWeight: 700,
            cursor: uploading ? "wait" : "pointer",
            background: uploading
              ? "rgba(168,85,247,0.2)"
              : "linear-gradient(135deg, #a855f7, #3b82f6)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(168,85,247,0.3)",
          }}
        >
          {uploading ? "Wird hochgeladen..." : "Logo speichern"}
        </button>
      )}

      {done && (
        <div style={{
          marginTop: 16,
          padding: "14px 20px",
          borderRadius: 12,
          background: "rgba(74,222,128,0.1)",
          border: "1px solid rgba(74,222,128,0.3)",
          color: "#4ade80",
          fontWeight: 600,
          fontSize: 15,
          textAlign: "center",
        }}>
          Logo gespeichert! Lade die Seite neu, um es in der Navbar zu sehen.
        </div>
      )}
    </div>
  );
}
