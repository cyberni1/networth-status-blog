"use client";

export default function PdfButton({ title }: { title: string }) {
  function handlePrint() {
    // Set a custom title for the print dialog
    const original = document.title;
    document.title = title + " – Vermögens-Zusammenfassung | PROMIVERMÖGEN";
    window.print();
    document.title = original;
  }

  return (
    <>
      <style>{`
        @media print {
          /* Hide everything except the article content */
          nav, header, footer, .vote-widget, .share-buttons,
          .pdf-btn-container, .breadcrumb-nav, .related-section,
          [data-noprint], .wealth-clock { display: none !important; }
          body { background: #fff !important; color: #000 !important; }
          .prose-wealth { color: #111 !important; font-size: 12pt !important; }
          .prose-wealth h2 { color: #000 !important; -webkit-text-fill-color: #000 !important; }
          .wealth-dashboard-print { border: 1pt solid #ccc !important; background: #f9f9f9 !important; color: #000 !important; }
          a { color: #000 !important; }
          @page { margin: 15mm; }
        }
      `}</style>
      <div className="pdf-btn-container" style={{ marginTop: "12px" }}>
        <button
          onClick={handlePrint}
          aria-label="Artikel als PDF speichern"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 600,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
          }}
        >
          <span aria-hidden="true">📄</span>
          Als PDF speichern
        </button>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "6px" }}>
          Werbefreie 1-Seiten-Zusammenfassung mit allen Kernzahlen
        </p>
      </div>
    </>
  );
}
