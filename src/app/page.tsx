"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Scissors,
  QrCode,
  Clock,
  Users,
  Zap,
  ChevronRight,
  Star,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  Shield,
} from "lucide-react";

const FEATURES = [
  {
    icon: QrCode,
    title: "Scan & Join",
    desc: "Scan the QR code at the counter — no app download, no sign-up friction.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Clock,
    title: "Live Wait Time",
    desc: "Real-time token tracking shows exactly how long before your turn.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Zap,
    title: "Instant Token",
    desc: "Just your name & phone. Token generated in under 5 seconds.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Users,
    title: "Queue Dashboard",
    desc: "Owners get a live console to manage their queue with one tap.",
    color: "from-emerald-500 to-teal-600",
  },
];

const STATS = [
  { value: "0", unit: "App Downloads", desc: "No install needed" },
  { value: "5s", unit: "Token Time", desc: "Instant booking" },
  { value: "40%", unit: "Less Waiting", desc: "Transparent queue" },
];

const TESTIMONIALS = [
  {
    name: "Rajesh Kumar",
    role: "Salon Owner, Bangalore",
    text: "Walk-ins doubled. Customers wait outside, come back when we call them!",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Regular Customer",
    text: "No more standing in queue for 45 mins. I just get the link and track live.",
    rating: 5,
  },
  {
    name: "Dr. Mehta",
    role: "Clinic Owner, Pune",
    text: "My patients love the transparency. No chaos at the reception anymore.",
    rating: 5,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [slugInput, setSlugInput] = useState("");

  const handleSlugJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugInput.trim()) router.push(`/${slugInput.trim()}`);
  };

  return (
    <div className="min-h-dvh bg-grid">
      {/* ── Ambient glow orbs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl" />
      </div>

      {/* ── Navigation ── */}
      <nav className="nav-bar">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">
              Queue<span className="gradient-text">Ease</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/onboarding" className="btn-secondary" style={{ width: "auto", padding: "8px 16px", fontSize: "14px" }}>
              For Businesses
            </Link>
            <Link href="/dashboard" className="btn-primary" style={{ width: "auto", padding: "8px 16px", fontSize: "14px" }}>
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center relative">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)" }}>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span style={{ fontSize: "13px", color: "#c4b5fd" }}>Live & Zero-Install Queue System</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-none">
            Skip the wait.<br />
            <span className="gradient-text">Track live.</span>
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10" style={{ color: "#8b8bad", lineHeight: 1.6 }}>
            QueueEase replaces chaotic walk-in queues at salons, barbers & clinics with a smart virtual token system.
            Scan the QR → Book your spot → Live-track your turn.
          </p>

          {/* Quick join form */}
          <form onSubmit={handleSlugJoin} className="max-w-md mx-auto mb-6 flex gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bad" }} />
              <input
                className="input-field"
                style={{ paddingLeft: "40px" }}
                placeholder="Enter salon/clinic short-link…"
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: "auto", padding: "14px 20px" }}>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p style={{ fontSize: "13px", color: "#4a4a6a" }}>
            Or try the demo:{" "}
            <Link href="/sharmas-premium-salon" className="underline" style={{ color: "#a78bfa" }}>
              sharmas-premium-salon
            </Link>
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-16">
          {STATS.map((s) => (
            <div key={s.unit} className="glass-card p-4 text-center">
              <div className="text-3xl font-black gradient-text">{s.value}</div>
              <div className="text-xs font-semibold mt-1" style={{ color: "#c4b5fd" }}>{s.unit}</div>
              <div className="text-xs mt-0.5" style={{ color: "#4a4a6a" }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">
          Everything you need, <span className="gradient-text">nothing you don't</span>
        </h2>
        <p className="text-center mb-12" style={{ color: "#8b8bad" }}>
          Built for Indian customers who hate queues and owners who hate chaos.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card glass-card-hover p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p style={{ fontSize: "14px", color: "#8b8bad", lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          How <span className="gradient-text">QueueEase</span> works
        </h2>
        <div className="grid sm:grid-cols-2 gap-8">
          {/* Customer flow */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold">For Customers</h3>
                <p style={{ fontSize: "13px", color: "#8b8bad" }}>Zero app download</p>
              </div>
            </div>
            {[
              "Scan QR at the counter or open the link",
              "Browse services & select what you need",
              "Enter name + phone → Get instant token",
              "Track live: see queue & wait time in real-time",
            ].map((step, i) => (
              <div key={i} className="flex gap-3 mb-4">
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(6,182,212,0.15)", color: "#22d3ee" }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: "14px", color: "#c4b5fd", lineHeight: 1.5 }}>{step}</p>
              </div>
            ))}
          </div>

          {/* Owner flow */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold">For Business Owners</h3>
                <p style={{ fontSize: "13px", color: "#8b8bad" }}>Full queue control</p>
              </div>
            </div>
            {[
              "Sign up & create your business profile in 2 mins",
              "Add your services with price & duration",
              "Download QR code standee for your counter",
              "Tap 'Call Next' to manage your live queue",
            ].map((step, i) => (
              <div key={i} className="flex gap-3 mb-4">
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: "14px", color: "#c4b5fd", lineHeight: 1.5 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Loved by businesses <span className="gradient-text">across India</span>
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="glass-card glass-card-hover p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p style={{ fontSize: "14px", color: "#c4b5fd", lineHeight: 1.6, marginBottom: "16px" }}>
                "{t.text}"
              </p>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p style={{ fontSize: "12px", color: "#8b8bad" }}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="glass-card p-8 text-center glow-purple">
          <h2 className="text-3xl font-bold mb-3">Ready to end queue chaos?</h2>
          <p className="mb-8" style={{ color: "#8b8bad" }}>
            Set up your business in under 2 minutes. Free forever for small businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <Link href="/onboarding" className="btn-primary">
              <Zap className="w-5 h-5" />
              Start Free — It's Easy
            </Link>
            <Link href="/sharmas-premium-salon" className="btn-secondary">
              View Live Demo
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            {["No credit card", "No app install", "Free for 1 location"].map((t) => (
              <div key={t} className="flex items-center gap-1.5" style={{ fontSize: "13px", color: "#8b8bad" }}>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-8 text-center" style={{ borderColor: "var(--qe-border)" }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
            <Scissors className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold">QueueEase</span>
        </div>
        <p style={{ fontSize: "13px", color: "#4a4a6a" }}>
          Built for Indian salons, barbers & clinics. Made with ❤️
        </p>
      </footer>
    </div>
  );
}
