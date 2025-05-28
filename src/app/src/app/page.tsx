"use client";

import { DollarSign, TrendingUp, Eye, ArrowRight, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="glass-nav flex items-center space-x-4">
          <DollarSign className="w-8 h-8 text-amber-400" />
          <span className="wealth-gradient text-xl font-bold">NETWORTH STATUS</span>
        </div>
      </nav>

      <section className="min-h-screen flex items-center justify-center px-4 pt-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Das <span className="wealth-gradient">Vermögen</span><br />
            der <span className="wealth-gradient">Reichen & Berühmten</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/70 mb-8">
            Entdecke die faszinierendsten Erfolgsgeschichten und Vermögenswerte der reichsten Menschen der Welt.
          </p>
          
          <button className="luxury-btn text-lg px-8 py-4">
            Entdecke die Reichsten <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </section>
    </div>
  );
}
