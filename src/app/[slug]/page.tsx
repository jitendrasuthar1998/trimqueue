"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scissors, MapPin, Clock, Star, ChevronRight, Users,
  AlertCircle, CheckCircle2, Phone, ArrowRight, Tag,
  Zap, Timer, QrCode, Loader2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { Business, Token, ServiceItem } from "@/lib/types";
import { formatINR, formatWaitTime, isBusinessOpen } from "@/lib/utils";
import ServiceSelector from "@/components/customer/ServiceSelector";
import TokenBookingForm from "@/components/customer/TokenBookingForm";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function BusinessPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { businesses, tokens } = useAppStore();

  const [step, setStep] = useState<"landing" | "services" | "booking">("landing");
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);

  const business = businesses.find((b) => b.slug === slug);
  const activeTokens = business
    ? tokens.filter((t) => t.bizId === business.id && ["waiting", "serving"].includes(t.status))
    : [];
  const waitingCount = activeTokens.filter((t) => t.status === "waiting").length;
  const servingToken = activeTokens.find((t) => t.status === "serving");

  // Estimate queue wait for new customer
  const estimatedWait = activeTokens.reduce((sum, t) => sum + t.totalDurationMins, 0)
    + (business?.delayBufferMins || 0);

  const businessOpen = business ? isBusinessOpen(business.timings) : false;

  if (!business) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center text-center p-4">
        <div className="glass-card p-8 max-w-sm w-full">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#8b8bad" }} />
          <h2 className="text-xl font-bold mb-2">Business Not Found</h2>
          <p className="mb-6" style={{ color: "#8b8bad" }}>
            No business found for "<strong>{slug}</strong>". Check the link and try again.
          </p>
          <Link href="/" className="btn-primary">Back to QueueEase</Link>
        </div>
      </div>
    );
  }

  const totalPrice = selectedServices.reduce((s, sv) => s + sv.price, 0);
  const totalDuration = selectedServices.reduce((s, sv) => s + sv.durationMins, 0);

  const handleTokenCreated = (tokenId: string) => {
    router.push(`/${slug}/token/${tokenId}`);
  };

  // ── Step: Landing / Business Info ──────────────────────────────────────────
  if (step === "landing") {
    return (
      <div className="min-h-dvh bg-grid">
        {/* Ambient */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        </div>

        {/* Banner / Header */}
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #13132a, #1c1c38)", minHeight: "200px" }}>
          {business.bannerUrl ? (
            <img src={business.bannerUrl} alt={business.name}
              className="absolute inset-0 w-full h-full object-cover opacity-30" />
          ) : (
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))" }} />
          )}
          <div className="relative z-10 max-w-lg mx-auto p-6 pt-safe-top">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="flex items-center gap-1.5 text-sm" style={{ color: "#8b8bad" }}>
                <Scissors className="w-4 h-4" style={{ color: "#a78bfa" }} />
                QueueEase
              </Link>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl"
                style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}>
                {business.businessType === "salon" ? "💇" :
                  business.businessType === "barber" ? "✂️" :
                  business.businessType === "clinic" ? "🏥" :
                  business.businessType === "spa" ? "💆" : "🏪"}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-black">{business.name}</h1>
                <div className="flex items-center gap-1.5 mt-1" style={{ color: "#8b8bad", fontSize: "13px" }}>
                  <MapPin className="w-3.5 h-3.5" />
                  {business.city}{business.landmark ? ` · Near ${business.landmark}` : ""}
                </div>
              </div>
            </div>

            {/* Status Chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className={`badge ${businessOpen ? "badge-open" : "badge-closed"}`}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: businessOpen ? "#34d399" : "#f87171" }} />
                {businessOpen ? "Open Now" : "Closed"}
              </span>
              <span className="badge badge-waiting">
                <Users className="w-3 h-3" />
                {waitingCount} waiting
              </span>
              <span className="badge" style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
                <Clock className="w-3 h-3" />
                {business.timings.open} – {business.timings.close}
              </span>
            </div>
          </div>
        </div>

        {/* Live Queue Status Card */}
        <div className="max-w-lg mx-auto px-4">
          <div className="glass-card p-5 -mt-4 relative z-10 mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#8b8bad" }}>
              Live Queue Status
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-black gradient-text">
                  {servingToken?.tokenNumber || "—"}
                </div>
                <div className="text-xs mt-1" style={{ color: "#8b8bad" }}>Now Serving</div>
              </div>
              <div>
                <div className="text-3xl font-black" style={{ color: "#fbbf24" }}>{waitingCount}</div>
                <div className="text-xs mt-1" style={{ color: "#8b8bad" }}>In Queue</div>
              </div>
              <div>
                <div className="text-3xl font-black" style={{ color: "#34d399" }}>
                  {formatWaitTime(estimatedWait)}
                </div>
                <div className="text-xs mt-1" style={{ color: "#8b8bad" }}>Est. Wait</div>
              </div>
            </div>

            {/* Mini progress bar */}
            {activeTokens.length > 0 && (
              <div className="mt-4">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (waitingCount / (waitingCount + 3)) * 100)}%` }} />
                </div>
                <p className="text-xs mt-1.5 text-center" style={{ color: "#8b8bad" }}>Queue occupancy</p>
              </div>
            )}
          </div>

          {/* Delay Warning */}
          {business.delayBufferMins > 0 && (
            <div className="glass-card p-3 mb-4 flex items-center gap-2"
              style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.05)" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#fbbf24" }} />
              <p className="text-sm" style={{ color: "#fbbf24" }}>
                Slight delay today — +{business.delayBufferMins} mins added to estimated wait
              </p>
            </div>
          )}

          {/* Services Preview */}
          <div className="glass-card p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Services</p>
              <span className="text-xs" style={{ color: "#8b8bad" }}>
                {business.services.filter((s) => s.isActive).length} available
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(business.services.filter((s) => s.isActive).map((s) => s.category))).map((cat) => (
                <span key={cat} className="category-chip" style={{ fontSize: "12px", padding: "4px 10px" }}>
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          {businessOpen ? (
            <button onClick={() => setStep("services")} className="btn-primary mb-4">
              <Zap className="w-5 h-5" />
              Book My Spot — Get Token
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="glass-card p-4 mb-4 text-center"
              style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
              <p className="font-semibold" style={{ color: "#f87171" }}>Shop is currently closed</p>
              <p className="text-sm mt-1" style={{ color: "#8b8bad" }}>
                Opens at {business.timings.open}
                {business.timings.offDays.length > 0 && ` · Closed on ${business.timings.offDays.join(", ")}`}
              </p>
            </div>
          )}

          {/* Address */}
          <div className="glass-card p-4 mb-8">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#a78bfa" }} />
              <p className="text-sm" style={{ color: "#c4b5fd" }}>{business.address}, {business.city}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Service Selection ────────────────────────────────────────────────
  if (step === "services") {
    return (
      <ServiceSelector
        business={business}
        selected={selectedServices}
        onSelect={setSelectedServices}
        onBack={() => setStep("landing")}
        onNext={() => setStep("booking")}
        totalPrice={totalPrice}
        totalDuration={totalDuration}
      />
    );
  }

  // ── Step: Customer Details & Token ────────────────────────────────────────
  if (step === "booking") {
    return (
      <TokenBookingForm
        business={business}
        selectedServices={selectedServices}
        onBack={() => setStep("services")}
        onTokenCreated={handleTokenCreated}
        estimatedWaitMins={estimatedWait + totalDuration}
      />
    );
  }

  return null;
}
