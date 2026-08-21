import { Link } from "react-router-dom";
import { Sprout, Tractor, ShoppingCart, Truck, ShieldCheck, Camera, ArrowRight, ArrowLeft } from "lucide-react";

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-ivory-100">
      <nav className="border-b border-sage-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-800">
              <Sprout className="h-5 w-5 text-sage-300" />
            </div>
            <span className="text-xl font-bold text-forest-900">Agrolink</span>
          </Link>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-800 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>

        <h1 className="text-3xl font-bold text-forest-900 mb-4">How Agrolink Works</h1>
        <p className="text-forest-500 mb-12">
          A complete supply chain platform connecting farmers, buyers, and transporters with trust at every step.
        </p>

        {/* Role sections */}
        <div className="space-y-8">
          <RoleSection
            icon={Tractor}
            color="bg-forest-700"
            title="For Farmers"
            steps={[
              "Create produce listings with crop details, quantity, and price.",
              "Receive orders from verified buyers who can see your trust score.",
              "Track your active orders and shipments in real time.",
              "Use AI Crop Intelligence to diagnose crop issues and get recommendations.",
            ]}
          />
          <RoleSection
            icon={ShoppingCart}
            color="bg-sage-500"
            title="For Buyers"
            steps={[
              "Browse the marketplace and search for specific crops.",
              "View farmer trust scores and verification before ordering.",
              "Place orders with transparent pricing — produce, logistics, and fees.",
              "Confirm delivery with proof of delivery and dispute protection.",
            ]}
          />
          <RoleSection
            icon={Truck}
            color="bg-gold-500"
            title="For Transporters"
            steps={[
              "View available delivery jobs matching your coverage area.",
              "Inspect farmer and buyer trust scores before accepting.",
              "Accept jobs and update status: picked up → in transit → delivered.",
              "Capture proof of delivery with photo evidence and quantity confirmation.",
            ]}
          />
        </div>

        {/* Trust system */}
        <div className="card p-8 mt-12 bg-forest-900 text-ivory-50 border-forest-800">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="h-8 w-8 text-gold-400" />
            <h2 className="text-2xl font-bold">The Cross-Role Trust System</h2>
          </div>
          <p className="text-sage-200 mb-6">
            Trust is the backbone of Agrolink. Every participant — farmer, buyer, and transporter — has a trust score based on completed transactions, fulfilment rate, and verification status. Trust scores appear everywhere: on listings, orders, shipments, and profiles.
          </p>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-gold-400">92</div>
              <div className="text-sm text-sage-300">Farmer trust</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gold-400">88</div>
              <div className="text-sm text-sage-300">Buyer trust</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gold-400">95</div>
              <div className="text-sm text-sage-300">Transporter trust</div>
            </div>
          </div>
        </div>

        {/* AI */}
        <div className="card p-8 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <Camera className="h-8 w-8 text-forest-700" />
            <h2 className="text-2xl font-bold text-forest-900">AI Crop Intelligence</h2>
          </div>
          <p className="text-forest-600 mb-4">
            Upload a photo of your crop and Agrolink's AI will analyze it for possible diseases, provide a confidence score, severity level, likely causes, and recommended actions. Then ask follow-up questions in English, Yorùbá, Igbo, or Hausa.
          </p>
          <p className="text-sm text-forest-500 mb-4">
            After diagnosis, the AI connects you back to the marketplace — find buyers, find transport, or manage your inventory.
          </p>
          <Link to="/login" className="btn-primary">
            Try it now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function RoleSection({ icon: Icon, color, title, steps }: { icon: typeof Tractor; color: string; title: string; steps: string[] }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color} text-white`}>
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold text-forest-900">{title}</h2>
      </div>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-forest-600">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-sage-100 text-xs font-bold text-forest-700">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
