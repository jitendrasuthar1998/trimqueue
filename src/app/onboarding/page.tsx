"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Scissors,
  ChevronRight,
  ChevronLeft,
  Store,
  Clock,
  Plus,
  Trash2,
  Check,
  Phone,
  MapPin,
  Building2,
  Tag,
  IndianRupee,
  Timer,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { generateSlug } from "@/lib/utils";
import type { ServiceItem, BusinessTimings } from "@/lib/types";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────
const step1Schema = z.object({
  ownerName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
});

const step2Schema = z.object({
  name: z.string().min(2, "Business name required"),
  businessType: z.enum(["salon", "barber", "clinic", "spa", "other"]),
  address: z.string().min(5, "Address required"),
  city: z.string().min(2, "City required"),
  landmark: z.string().optional(),
  openTime: z.string(),
  closeTime: z.string(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const BUSINESS_TYPES = [
  { value: "salon", label: "💇 Salon", desc: "Unisex / Ladies Salon" },
  { value: "barber", label: "✂️ Barber", desc: "Barber Shop / Men's Grooming" },
  { value: "clinic", label: "🏥 Clinic", desc: "Doctor / Dental / Eye" },
  { value: "spa", label: "💆 Spa", desc: "Spa & Wellness" },
  { value: "other", label: "🏪 Other", desc: "Any queued business" },
];

const SERVICE_CATEGORIES = ["Hair", "Beard", "Skin", "Massage", "Nails", "Consultation", "Other"];

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: "s1", name: "Men's Haircut", price: 150, durationMins: 30, category: "Hair", isActive: true },
  { id: "s2", name: "Beard Styling", price: 80, durationMins: 15, category: "Beard", isActive: true },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { createBusiness, setCurrentVendorId } = useAppStore();

  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [offDays, setOffDays] = useState<string[]>(["Sunday"]);
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [newSvc, setNewSvc] = useState({ name: "", price: "", durationMins: "", category: "Hair" });
  const [isLoading, setIsLoading] = useState(false);

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { businessType: "salon", openTime: "09:00", closeTime: "21:00" },
  });

  const toggleOffDay = (day: string) => {
    setOffDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const addService = () => {
    if (!newSvc.name || !newSvc.price || !newSvc.durationMins) return;
    const svc: ServiceItem = {
      id: `s-${Date.now()}`,
      name: newSvc.name,
      price: Number(newSvc.price),
      durationMins: Number(newSvc.durationMins),
      category: newSvc.category,
      isActive: true,
    };
    setServices((s) => [...s, svc]);
    setNewSvc({ name: "", price: "", durationMins: "", category: "Hair" });
  };

  const removeService = (id: string) => setServices((s) => s.filter((sv) => sv.id !== id));

  const onStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
  };

  const onStep2Submit = async (data: Step2Data) => {
    if (!step1Data) return;
    setIsLoading(true);

    const biz = createBusiness({
      ownerName: step1Data.ownerName,
      phone: step1Data.phone,
      name: data.name,
      slug: generateSlug(data.name) + "-" + Math.random().toString(36).slice(2, 6),
      address: data.address,
      city: data.city,
      landmark: data.landmark,
      businessType: data.businessType,
      timings: { open: data.openTime, close: data.closeTime, offDays },
      services,
      currentServingToken: 0,
      nextTokenNumber: 1,
      isOpen: true,
      delayBufferMins: 0,
      bannerUrl: "",
    });

    setCurrentVendorId(biz.id);
    await new Promise((r) => setTimeout(r, 1000)); // simulated async
    router.push("/dashboard");
  };

  return (
    <div className="min-h-dvh bg-grid flex flex-col">
      {/* Ambient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="nav-bar">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold">Queue<span className="gradient-text">Ease</span></span>
          </Link>
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: s <= step ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "var(--qe-surface-2)",
                    color: s <= step ? "white" : "var(--qe-text-dim)",
                  }}
                >
                  {s < step ? <Check className="w-3 h-3" /> : s}
                </div>
                {s < 2 && <div className="w-8 h-0.5" style={{ background: step > s ? "#7c3aed" : "var(--qe-border)" }} />}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        {/* ── Step 1: Owner Verification ── */}
        {step === 1 && (
          <div className="animate-slide-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mx-auto mb-4 animate-float">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Welcome, Business Owner!</h1>
              <p style={{ color: "#8b8bad", fontSize: "14px" }}>
                Let's set up your QueueEase profile. Takes less than 2 minutes.
              </p>
            </div>

            <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#c4b5fd" }}>
                  Your Full Name
                </label>
                <input
                  className={`input-field ${form1.formState.errors.ownerName ? "error" : ""}`}
                  placeholder="e.g. Rajesh Sharma"
                  {...form1.register("ownerName")}
                />
                {form1.formState.errors.ownerName && (
                  <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                    {form1.formState.errors.ownerName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#c4b5fd" }}>
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: "#8b8bad" }}>
                    +91
                  </span>
                  <input
                    className={`input-field ${form1.formState.errors.phone ? "error" : ""}`}
                    style={{ paddingLeft: "48px" }}
                    placeholder="9876543210"
                    maxLength={10}
                    inputMode="numeric"
                    {...form1.register("phone")}
                  />
                </div>
                {form1.formState.errors.phone && (
                  <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                    {form1.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="glass-card p-4 mt-4" style={{ borderColor: "rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.05)" }}>
                <p className="text-xs" style={{ color: "#fbbf24" }}>
                  📱 Demo mode: OTP verification is simulated. In production, Firebase Auth sends a real OTP.
                </p>
              </div>

              <button type="submit" className="btn-primary mt-6">
                <Sparkles className="w-5 h-5" />
                Continue to Business Setup
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* ── Step 2: Business Profile + Services ── */}
        {step === 2 && (
          <div className="animate-slide-up">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 mb-6 text-sm" style={{ color: "#8b8bad" }}>
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-2xl font-bold mb-1">Business Profile</h1>
            <p className="text-sm mb-8" style={{ color: "#8b8bad" }}>Tell us about your business</p>

            <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-6">
              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: "#c4b5fd" }}>Business Type</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {BUSINESS_TYPES.map((t) => (
                    <label
                      key={t.value}
                      className="service-card cursor-pointer"
                      style={{ padding: "12px" }}
                    >
                      <input type="radio" className="sr-only" value={t.value} {...form2.register("businessType")} />
                      <div className={`service-card ${form2.watch("businessType") === t.value ? "selected" : ""}`}
                        style={{ border: "none", padding: 0, background: "transparent" }}>
                        <div className="font-medium text-sm">{t.label}</div>
                        <div className="text-xs mt-0.5" style={{ color: "#8b8bad" }}>{t.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#c4b5fd" }}>
                  Business Name
                </label>
                <input
                  className={`input-field ${form2.formState.errors.name ? "error" : ""}`}
                  placeholder="e.g. Sharma's Premium Salon"
                  {...form2.register("name")}
                />
                {form2.watch("name") && (
                  <p className="text-xs mt-1" style={{ color: "#8b8bad" }}>
                    Your link: queueease.app/<span style={{ color: "#a78bfa" }}>{generateSlug(form2.watch("name"))}</span>-xxxx
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#c4b5fd" }}>City</label>
                  <input className="input-field" placeholder="Bangalore" {...form2.register("city")} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#c4b5fd" }}>Landmark</label>
                  <input className="input-field" placeholder="Near Mall" {...form2.register("landmark")} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#c4b5fd" }}>Full Address</label>
                <input className="input-field" placeholder="45, MG Road, Indiranagar" {...form2.register("address")} />
              </div>

              {/* Timings */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: "#c4b5fd" }}>
                  <Clock className="w-4 h-4 inline mr-1" />
                  Operating Hours
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: "#8b8bad" }}>Opens at</label>
                    <input type="time" className="input-field" {...form2.register("openTime")} />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: "#8b8bad" }}>Closes at</label>
                    <input type="time" className="input-field" {...form2.register("closeTime")} />
                  </div>
                </div>
                <div>
                  <label className="text-xs mb-2 block" style={{ color: "#8b8bad" }}>Off Days (select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleOffDay(d)}
                        className="category-chip"
                        style={offDays.includes(d) ? { background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.4)", color: "#f87171" } : {}}
                      >
                        {d.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: "#c4b5fd" }}>
                  <Tag className="w-4 h-4 inline mr-1" />
                  Services Menu
                </label>
                <div className="space-y-2 mb-3">
                  {services.map((svc) => (
                    <div key={svc.id} className="token-row">
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold"
                        style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>
                        {svc.category.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{svc.name}</p>
                        <p className="text-xs" style={{ color: "#8b8bad" }}>₹{svc.price} · {svc.durationMins} mins</p>
                      </div>
                      <button type="button" onClick={() => removeService(svc.id)} className="btn-icon" style={{ padding: "6px" }}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add service form */}
                <div className="glass-card p-4">
                  <p className="text-xs font-medium mb-3" style={{ color: "#c4b5fd" }}>Add Service</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      className="input-field"
                      style={{ fontSize: "13px", padding: "10px 12px" }}
                      placeholder="Service name"
                      value={newSvc.name}
                      onChange={(e) => setNewSvc((s) => ({ ...s, name: e.target.value }))}
                    />
                    <select
                      className="input-field"
                      style={{ fontSize: "13px", padding: "10px 12px" }}
                      value={newSvc.category}
                      onChange={(e) => setNewSvc((s) => ({ ...s, category: e.target.value }))}
                    >
                      {SERVICE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#8b8bad" }}>₹</span>
                      <input
                        className="input-field"
                        style={{ fontSize: "13px", padding: "10px 12px 10px 24px" }}
                        placeholder="Price"
                        inputMode="numeric"
                        value={newSvc.price}
                        onChange={(e) => setNewSvc((s) => ({ ...s, price: e.target.value }))}
                      />
                    </div>
                    <div className="relative">
                      <input
                        className="input-field"
                        style={{ fontSize: "13px", padding: "10px 36px 10px 12px" }}
                        placeholder="Duration"
                        inputMode="numeric"
                        value={newSvc.durationMins}
                        onChange={(e) => setNewSvc((s) => ({ ...s, durationMins: e.target.value }))}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#8b8bad" }}>min</span>
                    </div>
                  </div>
                  <button type="button" onClick={addService} className="btn-secondary" style={{ fontSize: "13px", padding: "8px 14px" }}>
                    <Plus className="w-4 h-4" /> Add Service
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Setting up your queue…</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Launch My QueueEase</>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
