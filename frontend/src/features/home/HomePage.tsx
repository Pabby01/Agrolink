import { Link } from "react-router-dom";
import { Sprout, Search, ShieldCheck, Truck, PackageCheck, Leaf, ArrowRight } from "lucide-react";

export function HomePage() {
  return (
    <div className="min-h-screen bg-ivory-100">
      {/* Nav */}
      <nav className="border-b border-sage-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-800">
              <Sprout className="h-5 w-5 text-sage-300" />
            </div>
            <span className="text-xl font-bold text-forest-900">Agrolink</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/how-it-works" className="text-sm font-medium text-forest-600 hover:text-forest-800">
              How it works
            </Link>
            <Link to="/login" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-forest-900 text-ivory-50">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, #7FAF8A 0%, transparent 50%), radial-gradient(circle at 80% 80%, #D6B85A 0%, transparent 50%)"
        }} />
        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-forest-700/50 px-4 py-1.5 text-sm text-sage-300 mb-6">
              <Leaf className="h-4 w-4" />
              AI Agricultural Supply Chain
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              The trusted network moving food from farm to market.
            </h1>
            <p className="text-lg text-sage-200 mb-8">
              Agrolink connects farmers, buyers, and transporters with verified trust scores, smart logistics matching, and AI crop intelligence — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/login" className="btn-gold text-base px-6 py-3">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/how-it-works" className="btn-outline text-ivory-50 border-sage-400 hover:bg-forest-800 text-base px-6 py-3">
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core loop */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-forest-900 mb-3">From Farm to Market in 6 Steps</h2>
          <p className="text-forest-500">A complete supply chain journey, powered by trust.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest-100">
                    <Icon className="h-5 w-5 text-forest-700" />
                  </div>
                  <span className="text-xs font-bold text-forest-400">STEP {i + 1}</span>
                </div>
                <h3 className="font-semibold text-forest-900 mb-1">{step.title}</h3>
                <p className="text-sm text-forest-500">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-forest-800 text-ivory-50 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { value: "92", label: "Avg farmer trust score" },
            { value: "97%", label: "Fulfilment rate" },
            { value: "3", label: "Verified roles" },
            { value: "1", label: "Connected platform" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl font-bold text-gold-400">{stat.value}</div>
              <div className="text-sm text-sage-300 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-forest-900 mb-4">Ready to move your produce?</h2>
        <p className="text-forest-500 mb-8 max-w-lg mx-auto">
          Join the Agrolink network today. Demo accounts are ready for you to explore the full supply chain journey.
        </p>
        <Link to="/login" className="btn-primary text-base px-8 py-3">
          Try the Demo
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-sage-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-forest-500">
          Agrolink — The trusted network moving food from farm to market.
        </div>
      </footer>
    </div>
  );
}

const steps = [
  { icon: Search, title: "Discover", desc: "Buyers browse verified produce listings from trusted farmers." },
  { icon: ShieldCheck, title: "Verify", desc: "Trust scores and verification badges build confidence before transacting." },
  { icon: PackageCheck, title: "Match", desc: "Smart logistics matching pairs orders with available transporters." },
  { icon: Truck, title: "Move", desc: "Transporters pick up and deliver with real-time status tracking." },
  { icon: ShieldCheck, title: "Deliver", desc: "Proof of delivery with photo evidence and quantity confirmation." },
  { icon: Leaf, title: "Build Trust", desc: "Every completed transaction strengthens your trust score." },
];
