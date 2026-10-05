"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft, User, Phone, Clock, IndianRupee,
  Zap, Loader2, CheckCircle2, AlertTriangle, Tag,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { Business, ServiceItem } from "@/lib/types";
import { formatWaitTime } from "@/lib/utils";

const schema = z.object({
  customerName: z.string().min(2, "Please enter your full name"),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  business: Business;
  selectedServices: ServiceItem[];
  onBack: () => void;
  onTokenCreated: (tokenId: string) => void;
  estimatedWaitMins: number;
}

export default function TokenBookingForm({
  business,
  selectedServices,
  onBack,
  onTokenCreated,
  estimatedWaitMins,
}: Props) {
  const { createToken } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const totalPrice = selectedServices.reduce((s, sv) => s + sv.price, 0);
  const totalDuration = selectedServices.reduce((s, sv) => s + sv.durationMins, 0);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate network

    const token = createToken({
      bizId: business.id,
      tokenNumber: business.nextTokenNumber,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      services: selectedServices.map((s) => s.id),
      serviceNames: selectedServices.map((s) => s.name),
      totalDurationMins: totalDuration,
      totalAmount: totalPrice,
      status: "waiting",
      isLate: false,
    });

    onTokenCreated(token.id);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-grid">
      {/* Nav */}
      <nav className="nav-bar">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm" style={{ color: "#8b8bad" }}>
            <ChevronLeft className="w-4 h-4" /> Services
          </button>
          <span className="font-semibold text-sm">{business.name}</span>
          <div />
        </div>
      </nav>

      <main className="max-w-lg mx-auto w-full px-4 py-6 flex-1">
        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl font-bold mb-1">Almost There!</h1>
          <p className="text-sm" style={{ color: "#8b8bad" }}>
            Enter your details to get your token. No OTP, no sign-up!
          </p>
        </div>

        {/* Booking Summary Card */}
        <div className="glass-card p-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#8b8bad" }}>
            Booking Summary
          </p>
          <div className="space-y-2 mb-3">
            {selectedServices.map((svc) => (
              <div key={svc.id} className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#a78bfa" }} />
                  <span>{svc.name}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: "#8b8bad" }}>
                  <span className="text-xs">{svc.durationMins}m</span>
                  <span className="font-medium" style={{ color: "#c4b5fd" }}>₹{svc.price}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-3" style={{ borderColor: "var(--qe-border)" }}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm" style={{ color: "#8b8bad" }}>
                <Clock className="w-4 h-4" />
                ~{totalDuration} mins
              </div>
              <div className="text-right">
                <p className="text-xs mb-0.5" style={{ color: "#8b8bad" }}>You'll pay at counter</p>
                <p className="text-xl font-black gradient-text">₹{totalPrice}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estimated Wait */}
        <div className="glass-card p-4 mb-6"
          style={{ borderColor: "rgba(124,58,237,0.25)", background: "rgba(124,58,237,0.05)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(124,58,237,0.15)" }}>
              <Zap className="w-5 h-5" style={{ color: "#a78bfa" }} />
            </div>
            <div>
              <p className="font-bold">{formatWaitTime(estimatedWaitMins)}</p>
              <p className="text-xs" style={{ color: "#8b8bad" }}>Estimated wait time after booking</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#c4b5fd" }}>
              Your Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bad" }} />
              <input
                className={`input-field ${errors.customerName ? "error" : ""}`}
                style={{ paddingLeft: "40px" }}
                placeholder="e.g. Amit Kumar"
                autoComplete="name"
                {...register("customerName")}
              />
            </div>
            {errors.customerName && (
              <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                {errors.customerName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#c4b5fd" }}>
              Mobile Number
            </label>
            <div className="relative flex">
              <div className="flex items-center px-3 rounded-l-xl border border-r-0"
                style={{ background: "var(--qe-surface-2)", borderColor: "var(--qe-border)", color: "#8b8bad", fontSize: "14px" }}>
                🇮🇳 +91
              </div>
              <input
                className={`input-field flex-1 ${errors.customerPhone ? "error" : ""}`}
                style={{ borderRadius: "0 12px 12px 0" }}
                placeholder="9876543210"
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel"
                {...register("customerPhone")}
              />
            </div>
            {errors.customerPhone && (
              <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                {errors.customerPhone.message}
              </p>
            )}
          </div>

          {/* Privacy note */}
          <div className="flex items-start gap-2 p-3 rounded-xl"
            style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)" }}>
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#22d3ee" }} />
            <p className="text-xs" style={{ color: "#7dd3fc" }}>
              Your number is only used for queue tracking. We never share it.
            </p>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating Token…</>
            ) : (
              <><Zap className="w-5 h-5" /> Get My Token — Free!</>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
