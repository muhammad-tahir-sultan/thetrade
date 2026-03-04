import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-secondary/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-2xl font-bold tracking-tighter">The Trade</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-semibold">
            <a href="#" className="text-secondary hover:text-primary transition-colors">Features</a>
            <a href="#" className="text-secondary hover:text-primary transition-colors">Solutions</a>
            <a href="#" className="text-secondary hover:text-primary transition-colors">Pricing</a>
            <button className="ml-4 px-6 py-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-md">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background blobs for premium feel */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 blur-[120px] opacity-20 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary rounded-full"></div>
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-accent rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="flex flex-col items-center text-center gap-10 mb-32">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-4">
              Next.js 16 + Tailwind v4
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight max-w-5xl leading-none">
              Build the future of the web with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">The Trade</span>
            </h1>
            <p className="text-xl md:text-2xl text-secondary max-w-3xl leading-relaxed">
              Experience the pinnacle of web development with our high-performance,
              premium-tailored Next.js boilerplate. Designed for speed, aesthetics, and total control.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-4">
              <a href="/dashboard" className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/25 hover:scale-105 transition-transform active:scale-95 text-center cursor-pointer">
                Open Dashboard
              </a>
              <a href="/auth/signup" className="w-full sm:w-auto px-10 py-5 bg-secondary/5 border border-secondary/10 rounded-2xl font-bold text-lg hover:bg-secondary/10 transition-colors text-center cursor-pointer">
                Create Account
              </a>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "Ultra Performance",
                description: "Optimized for Core Web Vitals with advanced caching and streaming strategies.",
                icon: "⚡"
              },
              {
                title: "Elegant Design",
                description: "A meticulously crafted design system that scales from landing pages to complex apps.",
                icon: "✨"
              },
              {
                title: "Scale First",
                description: "Built with modularity in mind, following SOLID principles for long-term maintainability.",
                icon: "📈"
              }
            ].map((feature, i) => (
              <div key={i} className="group relative p-10 rounded-[2.5rem] bg-secondary/5 border border-secondary/10 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5">
                <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-secondary text-lg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-16 border-t border-secondary/10 bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-secondary text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">T</span>
            </div>
            <span className="font-bold text-foreground">The Trade Engine</span>
          </div>
          <p>© {new Date().getFullYear()} All rights reserved. Built for pioneers.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors cursor-pointer">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors cursor-pointer">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
