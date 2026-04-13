"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface Faq {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: Faq[];
}

export default function FaqSection({ faqs }: FaqSectionProps) {
  const [open, setOpen] = useState<number | null>(0);

  if (!faqs.length) return null;

  return (
    <section className="mt-12 pt-10 border-t border-white/5">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <HelpCircle className="w-6 h-6 text-purple-400" />
        Häufig gestellte Fragen
      </h2>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="glass-card overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/3"
            >
              <span className="font-semibold text-white/90 pr-4">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-purple-400 flex-shrink-0 transition-transform duration-200 ${
                  open === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {open === i && (
              <div className="px-5 pb-5 text-white/60 leading-relaxed border-t border-white/5 pt-4">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
