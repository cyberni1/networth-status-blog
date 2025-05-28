"use client";

import { DollarSign, TrendingUp, Eye, ArrowRight, Clock, Star, Crown, Gem } from "lucide-react";

export default function HomePage() {
  const featuredPosts = [
    {
      id: 1,
      title: "Elon Musk: Das Vermögen des reichsten Mannes der Welt",
      excerpt: "Ein detaillierter Blick auf Elon Musks Milliarden-Empire und wie er zum reichsten Menschen der Welt wurde.",
      netWorth: "219.2 Milliarden €",
      change: "+15.2%",
      image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop",
      readTime: "8 min",
      views: "2.4k",
      category: "Tech-Milliardäre"
    },
    {
      id: 2,
      title: "Cristiano Ronaldo: Fußball-Legende mit Milliarden-Vermögen",
      excerpt: "Wie der portugiesische Superstar durch Fußball und kluge Investments ein Vermögen von über einer Milliarde aufbaute.",
      netWorth: "1.1 Milliarden €",
      change: "+8.7%",
      image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop",
      readTime: "6 min",
      views: "3.8k",
      category: "Sport-Stars"
    },
    {
      id: 3,
      title: "Kylie Jenner: Das jüngste Mitglied im Milliardärs-Club",
      excerpt: "Von Reality-TV-Star zur Milliardärin - die beeindruckende Erfolgsgeschichte von Kylie Cosmetics.",
      netWorth: "900 Millionen €",
      change: "+12.3%",
      image: "https://images.unsplash.com/photo-1494790108755-2616c326973e?w=800&h=600&fit=crop",
      readTime: "5 min",
      views: "5.2k",
      category: "Influencer"
    }
  ];

  const topCategories = [
    { name: "Tech-Milliardäre", count: 127, icon: <Gem className="w-5 h-5" /> },
    { name: "Sport-Stars", count: 89, icon: <Star className="w-5 h-5" /> },
    { name: "Entertainment", count: 156, icon: <Crown className="w-5 h-5" /> },
    { name: "Influencer", count: 234, icon: <TrendingUp className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="glass-nav flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-8 h-8 text-amber-400" />
            <span className="wealth-gradient text-xl font-bold">NETWORTH STATUS</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#home" className="text-white/80 hover:text-white transition-colors">Home</a>
            <a href="#blog" className="text-white/80 hover:text-white transition-colors">Blog</a>
            <a href="#kategorien" className="text-white/80 hover:text-white transition-colors">Kategorien</a>
            <a href="#trending" className="text-white/80 hover:text-white transition-colors">Trending</a>
          </div>
          
          <button className="luxury-btn hidden md:block">
            Newsletter <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center px-4 pt-24">
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <div className="glass-card mb-8 inline-block">
            <div className="status-badge">
              <TrendingUp className="w-4 h-4 mr-2" />
              Live Updates • Täglich aktualisiert
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Das <span className="wealth-gradient">Vermögen</span><br />
            der <span className="wealth-gradient">Reichen & Berühmten</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-4xl mx-auto">
            Entdecke die faszinierendsten Erfolgsgeschichten und Vermögenswerte der reichsten Menschen der Welt. 
            Von Tech-Milliardären bis zu Entertainment-Stars - alle Zahlen, Fakten und Hintergründe.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="luxury-btn text-lg px-8 py-4">
              Entdecke die Reichsten <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button className="glass-base border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-full">
              <Eye className="w-5 h-5 mr-2" />
              Trending Posts
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-card text-center">
              <div className="money-display text-2xl mb-2">500+</div>
              <div className="text-white/60">Profile analysiert</div>
            </div>
            <div className="glass-card text-center">
              <div className="money-display text-2xl mb-2">€2.1T</div>
              <div className="text-white/60">Gesamtvermögen</div>
            </div>
            <div className="glass-card text-center">
              <div className="money-display text-2xl mb-2">50k+</div>
              <div className="text-white/60">Monatliche Leser</div>
            </div>
            <div className="glass-card text-center">
              <div className="money-display text-2xl mb-2">24/7</div>
              <div className="text-white/60">Live Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="kategorien" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Entdecke nach <span className="wealth-gradient">Kategorien</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Von Tech-Giganten bis zu Entertainment-Stars - finde die Vermögenswerte deiner Lieblings-Persönlichkeiten
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topCategories.map((category) => (
              <div key={category.name} className="glass-card cursor-pointer group">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-full bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <p className="text-white/60 text-sm">{category.count} Profile</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-sm">Erkunden</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section id="blog" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="wealth-gradient">Trending</span> Vermögens-Stories
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Die aktuellsten und spannendsten Einblicke in die Vermögen der Reichen und Berühmten
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredPosts.map((post) => (
              <div key={post.id} className="glass-card group cursor-pointer">
                <div className="relative mb-4 overflow-hidden rounded-xl">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="status-badge">{post.category}</div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="glass-base px-3 py-1 rounded-full text-sm text-white">
                      {post.change}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-white/60 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="money-display text-lg">{post.netWorth}</div>
                    <div className="flex items-center space-x-4 text-white/40 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <span className="text-amber-400 text-xs font-medium">NS</span>
                      </div>
                      <span className="text-white/60 text-sm">NETWORTH STATUS</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <DollarSign className="w-8 h-8 text-amber-400" />
              <span className="wealth-gradient text-xl font-bold">NETWORTH STATUS</span>
            </div>
            
            <div className="flex items-center space-x-6 text-white/60">
              <a href="/impressum" className="hover:text-white transition-colors">Impressum</a>
              <a href="/datenschutz" className="hover:text-white transition-colors">Datenschutz</a>
              <a href="/kontakt" className="hover:text-white transition-colors">Kontakt</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/40">
            <p>&copy; 2025 NETWORTH STATUS. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
