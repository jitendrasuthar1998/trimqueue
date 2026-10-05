"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Scissors, Users, ChevronRight, Bell, BellOff, Clock,
  ArrowRight, Plus, Trash2, Edit2, QrCode, AlertTriangle,
  CheckCircle2, XCircle, LogOut, BarChart3, Zap, Timer,
  Phone, User, Loader2, Settings, ChevronDown, AlertCircle, Tag,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { Business, Token, ServiceItem } from "@/lib/types";
import { formatINR, formatWaitTime, isBusinessOpen } from "@/lib/utils";
import QRCode from "react-qr-code";

// ─── Helper: Estimate wait for the queue ────────────────────────────────────
function estimateQueueWait(tokens: Token[], delayBuffer: number): number {
  const waiting = tokens.filter((t) => t.status === "waiting");
  const serving = tokens.find((t) => t.status === "serving");
  const servingMins = serving ? Math.ceil(serving.totalDurationMins * 0.5) : 0; // half elapsed
  const waitingMins = waiting.reduce((sum, t) => sum + t.totalDurationMins, 0);
  return servingMins + waitingMins + delayBuffer;
}

// ─── Add Walk-in Modal ───────────────────────────────────────────────────────
function AddWalkInModal({
  business,
  onClose,
  onAdd,
}: {
  business: Business;
  onClose: () => void;
  onAdd: (name: string, phone: string, serviceIds: string[]) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || selected.length === 0) return;
    onAdd(name, phone, selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bottom-sheet sm:relative sm:rounded-2xl sm:max-w-md w-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg">Add Walk-in Customer</h3>
          <button onClick={onClose} className="btn-icon"><XCircle className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="input-field" placeholder="Customer Name" value={name}
            onChange={(e) => setName(e.target.value)} required />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#8b8bad" }}>+91</span>
            <input className="input-field" style={{ paddingLeft: "44px" }} placeholder="Mobile Number"
              inputMode="numeric" maxLength={10} value={phone}
              onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "#c4b5fd" }}>Select Services</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {business.services.filter((s) => s.isActive).map((svc) => (
                <label key={svc.id} className={`service-card flex items-center gap-3 ${selected.includes(svc.id) ? "selected" : ""}`}
                  style={{ padding: "10px 12px", cursor: "pointer" }}>
                  <input type="checkbox" className="sr-only" checked={selected.includes(svc.id)}
                    onChange={() => toggle(svc.id)} />
                  <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all`}
                    style={{
                      background: selected.includes(svc.id) ? "#7c3aed" : "transparent",
                      border: selected.includes(svc.id) ? "none" : "1px solid var(--qe-border)"
                    }}>
                    {selected.includes(svc.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{svc.name}</p>
                    <p className="text-xs" style={{ color: "#8b8bad" }}>₹{svc.price} · {svc.durationMins} min</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={!name || !phone || selected.length === 0}>
            <Plus className="w-4 h-4" /> Add to Queue
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── QR Code Modal ───────────────────────────────────────────────────────────
function QRModal({ business, onClose }: { business: Business; onClose: () => void }) {
  const url = `${typeof window !== "undefined" ? window.location.origin : "https://queueease.app"}/${business.slug}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-card p-6 max-w-xs w-full text-center">
        <h3 className="font-bold text-lg mb-1">{business.name}</h3>
        <p className="text-xs mb-4" style={{ color: "#8b8bad" }}>
          Print and place this at your counter
        </p>
        <div className="bg-white p-4 rounded-xl mb-4 flex items-center justify-center">
          <QRCode value={url} size={200} />
        </div>
        <p className="text-xs mb-4 font-mono" style={{ color: "#a78bfa", wordBreak: "break-all" }}>{url}</p>
        <button onClick={onClose} className="btn-secondary">Close</button>
      </div>
    </div>
  );
}

// ─── Delay Buffer Modal ───────────────────────────────────────────────────────
function DelayModal({ business, onClose, onAdd }: { business: Business; onClose: () => void; onAdd: (m: number) => void }) {
  const [mins, setMins] = useState(10);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bottom-sheet sm:relative sm:rounded-2xl sm:max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.15)" }}>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold">Emergency Delay</h3>
            <p className="text-xs" style={{ color: "#8b8bad" }}>Add buffer time to all waiting tokens</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          {[5, 10, 15, 20, 30].map((m) => (
            <button key={m} onClick={() => setMins(m)}
              className="category-chip"
              style={mins === m ? { background: "rgba(245,158,11,0.15)", borderColor: "rgba(245,158,11,0.4)", color: "#fbbf24" } : {}}>
              +{m}m
            </button>
          ))}
        </div>
        <button onClick={() => { onAdd(mins); onClose(); }}
          className="btn-primary" style={{ background: "linear-gradient(135deg,#d97706,#f59e0b)" }}>
          <AlertTriangle className="w-4 h-4" />
          Add {mins} Minute Delay
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { currentVendorId, businesses, tokens, callNextToken, createToken, updateToken, addDelayBuffer } = useAppStore();

  const [activeTab, setActiveTab] = useState<"queue" | "services" | "settings">("queue");
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showDelay, setShowDelay] = useState(false);
  const [lastCalled, setLastCalled] = useState<number | null>(null);

  // Find current vendor's business
  const business = businesses.find((b) => b.id === currentVendorId) || businesses[0];
  const bizTokens = tokens.filter((t) => t.bizId === business?.id);
  const activeTokens = bizTokens.filter((t) => ["waiting", "serving"].includes(t.status))
    .sort((a, b) => a.tokenNumber - b.tokenNumber);
  const servingToken = activeTokens.find((t) => t.status === "serving");
  const waitingTokens = activeTokens.filter((t) => t.status === "waiting");

  if (!business) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center text-center p-4">
        <AlertCircle className="w-12 h-12 mb-4" style={{ color: "#8b8bad" }} />
        <h2 className="text-xl font-bold mb-2">No business found</h2>
        <p className="mb-4" style={{ color: "#8b8bad" }}>Please set up your business first</p>
        <Link href="/onboarding" className="btn-primary" style={{ width: "auto", padding: "12px 24px" }}>
          Set Up Business
        </Link>
      </div>
    );
  }

  const totalWaitMins = estimateQueueWait(activeTokens, business.delayBufferMins);
  const isOpen = isBusinessOpen(business.timings);

  const handleCallNext = () => {
    const next = waitingTokens[0];
    if (next) setLastCalled(next.tokenNumber);
    callNextToken(business.id);
  };

  const handleAddWalkIn = (name: string, phone: string, serviceIds: string[]) => {
    const selectedServices = business.services.filter((s) => serviceIds.includes(s.id));
    createToken({
      bizId: business.id,
      tokenNumber: business.nextTokenNumber,
      customerName: name,
      customerPhone: phone,
      services: serviceIds,
      serviceNames: selectedServices.map((s) => s.name),
      totalDurationMins: selectedServices.reduce((sum, s) => sum + s.durationMins, 0),
      totalAmount: selectedServices.reduce((sum, s) => sum + s.price, 0),
      status: "waiting",
      isLate: false,
    });
  };

  return (
    <div className="min-h-dvh">
      {/* Modals */}
      {showWalkIn && <AddWalkInModal business={business} onClose={() => setShowWalkIn(false)} onAdd={handleAddWalkIn} />}
      {showQR && <QRModal business={business} onClose={() => setShowQR(false)} />}
      {showDelay && <DelayModal business={business} onClose={() => setShowDelay(false)} onAdd={(m) => addDelayBuffer(business.id, m)} />}

      {/* Nav */}
      <nav className="nav-bar">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm">{business.name}</span>
              <span className={`badge ml-2 ${isOpen ? "badge-open" : "badge-closed"}`}
                style={{ fontSize: "10px", padding: "2px 8px" }}>
                {isOpen ? "Open" : "Closed"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowQR(true)} className="btn-icon">
              <QrCode className="w-4 h-4" />
            </button>
            <Link href={`/${business.slug}`} className="btn-icon" target="_blank">
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* ── Stats Row ── */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="glass-card p-3 text-center">
            <div className="text-2xl font-black gradient-text">{business.currentServingToken || "—"}</div>
            <div className="text-xs mt-0.5" style={{ color: "#8b8bad" }}>Now Serving</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-2xl font-black" style={{ color: "#fbbf24" }}>{waitingTokens.length}</div>
            <div className="text-xs mt-0.5" style={{ color: "#8b8bad" }}>Waiting</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-2xl font-black" style={{ color: "#34d399" }}>{formatWaitTime(totalWaitMins)}</div>
            <div className="text-xs mt-0.5" style={{ color: "#8b8bad" }}>Est. Wait</div>
          </div>
        </div>

        {/* ── Delay Banner ── */}
        {business.delayBufferMins > 0 && (
          <div className="glass-card p-3 mb-4 flex items-center gap-3"
            style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.05)" }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#fbbf24" }} />
            <p className="text-sm flex-1" style={{ color: "#fbbf24" }}>
              +{business.delayBufferMins} min delay active for all tokens
            </p>
            <button onClick={() => addDelayBuffer(business.id, -business.delayBufferMins)}
              className="text-xs" style={{ color: "#8b8bad" }}>Clear</button>
          </div>
        )}

        {/* ── Tab Bar ── */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: "var(--qe-surface)" }}>
          {[
            { key: "queue", icon: Users, label: "Live Queue" },
            { key: "services", icon: Tag, label: "Services" },
            { key: "settings", icon: Settings, label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.key ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "transparent",
                color: activeTab === tab.key ? "white" : "var(--qe-text-muted)",
              }}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── QUEUE TAB ── */}
        {activeTab === "queue" && (
          <div className="animate-fade-in">
            {/* Call Next Button */}
            <button
              onClick={handleCallNext}
              disabled={waitingTokens.length === 0 && !servingToken}
              className="cta-call-next mb-3"
              style={waitingTokens.length === 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
              <CheckCircle2 className="w-6 h-6" />
              Call Next Token
            </button>

            {/* Action Row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button onClick={() => setShowWalkIn(true)} className="btn-secondary">
                <Plus className="w-4 h-4" /> Add Walk-in
              </button>
              <button onClick={() => setShowDelay(true)} className="btn-secondary"
                style={{ color: "#fbbf24", borderColor: "rgba(245,158,11,0.2)" }}>
                <AlertTriangle className="w-4 h-4" /> Emergency Delay
              </button>
            </div>

            {/* Last Called Banner */}
            {lastCalled && (
              <div className="glass-card p-3 mb-4 flex items-center gap-3"
                style={{ borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.06)" }}>
                <Zap className="w-4 h-4" style={{ color: "#34d399" }} />
                <p className="text-sm" style={{ color: "#34d399" }}>
                  Now calling Token #{lastCalled}
                </p>
              </div>
            )}

            {/* Queue List */}
            <div className="space-y-2">
              {activeTokens.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Users className="w-10 h-10 mx-auto mb-3" style={{ color: "#4a4a6a" }} />
                  <p style={{ color: "#8b8bad" }}>No active tokens right now</p>
                  <p className="text-sm mt-1" style={{ color: "#4a4a6a" }}>Walk-ins or QR scans will appear here</p>
                </div>
              ) : (
                activeTokens.map((token) => (
                  <div key={token.id} className={`token-row ${token.status === "serving" ? "serving" : ""}`}>
                    {/* Token Number */}
                    <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-lg"
                      style={{
                        background: token.status === "serving"
                          ? "linear-gradient(135deg,#059669,#0d9488)"
                          : "rgba(124,58,237,0.15)",
                        color: token.status === "serving" ? "white" : "#a78bfa",
                      }}>
                      #{token.tokenNumber}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm">{token.customerName}</p>
                        {token.isLate && (
                          <span className="badge badge-cancelled" style={{ fontSize: "10px", padding: "1px 6px" }}>Late</span>
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: "#8b8bad" }}>
                        {token.serviceNames.join(", ")} · ₹{token.totalAmount}
                      </p>
                    </div>
                    {/* Status + Actions */}
                    <div className="flex flex-col items-end gap-1">
                      <span className={`badge ${token.status === "serving" ? "badge-serving" : "badge-waiting"}`}
                        style={{ fontSize: "10px" }}>
                        {token.status === "serving" ? "Serving" : "Waiting"}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => updateToken(token.id, { isLate: !token.isLate })}
                          className="btn-icon" style={{ padding: "4px" }} title="Mark Late">
                          <Clock className="w-3 h-3" />
                        </button>
                        <button onClick={() => updateToken(token.id, { status: "cancelled" })}
                          className="btn-icon" style={{ padding: "4px", color: "#f87171" }} title="Cancel">
                          <XCircle className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── SERVICES TAB ── */}
        {activeTab === "services" && (
          <ServicesTab business={business} />
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === "settings" && (
          <SettingsTab business={business} />
        )}
      </main>
    </div>
  );
}

// ─── Services Tab ────────────────────────────────────────────────────────────
function ServicesTab({ business }: { business: Business }) {
  const { updateBusiness } = useAppStore();
  const [editId, setEditId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newSvc, setNewSvc] = useState({ name: "", price: "", durationMins: "", category: "Hair" });

  const SERVICE_CATEGORIES = ["Hair", "Beard", "Skin", "Massage", "Nails", "Consultation", "Other"];

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
    updateBusiness(business.id, { services: [...business.services, svc] });
    setNewSvc({ name: "", price: "", durationMins: "", category: "Hair" });
    setShowAdd(false);
  };

  const toggleActive = (id: string) => {
    updateBusiness(business.id, {
      services: business.services.map((s) => s.id === id ? { ...s, isActive: !s.isActive } : s),
    });
  };

  const deleteService = (id: string) => {
    updateBusiness(business.id, { services: business.services.filter((s) => s.id !== id) });
  };

  const grouped = business.services.reduce((acc, svc) => {
    if (!acc[svc.category]) acc[svc.category] = [];
    acc[svc.category].push(svc);
    return acc;
  }, {} as Record<string, ServiceItem[]>);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold">Services Menu</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary"
          style={{ width: "auto", padding: "8px 14px", fontSize: "13px" }}>
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {showAdd && (
        <div className="glass-card p-4 mb-4">
          <p className="text-sm font-medium mb-3" style={{ color: "#c4b5fd" }}>New Service</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input className="input-field" style={{ fontSize: "13px", padding: "10px" }}
              placeholder="Name" value={newSvc.name} onChange={(e) => setNewSvc(s => ({ ...s, name: e.target.value }))} />
            <select className="input-field" style={{ fontSize: "13px", padding: "10px" }}
              value={newSvc.category} onChange={(e) => setNewSvc(s => ({ ...s, category: e.target.value }))}>
              {SERVICE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <input className="input-field" style={{ fontSize: "13px", padding: "10px" }}
              placeholder="Price (₹)" inputMode="numeric" value={newSvc.price}
              onChange={(e) => setNewSvc(s => ({ ...s, price: e.target.value }))} />
            <input className="input-field" style={{ fontSize: "13px", padding: "10px" }}
              placeholder="Duration (min)" inputMode="numeric" value={newSvc.durationMins}
              onChange={(e) => setNewSvc(s => ({ ...s, durationMins: e.target.value }))} />
          </div>
          <button onClick={addService} className="btn-primary" style={{ fontSize: "13px", padding: "10px" }}>
            <Plus className="w-4 h-4" /> Save Service
          </button>
        </div>
      )}

      {Object.entries(grouped).map(([cat, svcs]) => (
        <div key={cat} className="mb-4">
          <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#8b8bad" }}>{cat}</p>
          <div className="space-y-2">
            {svcs.map((svc) => (
              <div key={svc.id} className="token-row" style={{ opacity: svc.isActive ? 1 : 0.5 }}>
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>
                  {svc.category.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{svc.name}</p>
                  <p className="text-xs" style={{ color: "#8b8bad" }}>₹{svc.price} · {svc.durationMins} min</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(svc.id)} className="btn-icon" style={{ padding: "6px" }}>
                    {svc.isActive ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                  </button>
                  <button onClick={() => deleteService(svc.id)} className="btn-icon" style={{ padding: "6px" }}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ business }: { business: Business }) {
  const { updateBusiness, setCurrentVendorId } = useAppStore();
  const router = useRouter();
  const url = `${typeof window !== "undefined" ? window.location.origin : "https://queueease.app"}/${business.slug}`;

  return (
    <div className="animate-fade-in space-y-4">
      <div className="glass-card p-4">
        <h3 className="font-semibold mb-3 text-sm">Business Info</h3>
        <div className="space-y-2 text-sm" style={{ color: "#c4b5fd" }}>
          <div className="flex justify-between">
            <span style={{ color: "#8b8bad" }}>Name</span>
            <span className="font-medium">{business.name}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#8b8bad" }}>City</span>
            <span className="font-medium">{business.city}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#8b8bad" }}>Hours</span>
            <span className="font-medium">{business.timings.open} – {business.timings.close}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#8b8bad" }}>Off Days</span>
            <span className="font-medium">{business.timings.offDays.join(", ") || "None"}</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="font-semibold mb-2 text-sm">Your Public Link</h3>
        <div className="p-3 rounded-xl mb-3 font-mono text-xs break-all"
          style={{ background: "var(--qe-surface-2)", color: "#a78bfa" }}>
          {url}
        </div>
        <button onClick={() => navigator.clipboard?.writeText(url)} className="btn-secondary" style={{ fontSize: "13px", padding: "10px" }}>
          Copy Link
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Shop Status</p>
            <p className="text-xs" style={{ color: "#8b8bad" }}>Toggle open/closed for customers</p>
          </div>
          <button
            onClick={() => updateBusiness(business.id, { isOpen: !business.isOpen })}
            className="relative w-12 h-6 rounded-full transition-all"
            style={{ background: business.isOpen ? "#059669" : "var(--qe-surface-2)" }}>
            <div className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow"
              style={{ left: business.isOpen ? "28px" : "4px" }} />
          </button>
        </div>
      </div>

      <button
        onClick={() => { setCurrentVendorId(null); router.push("/"); }}
        className="btn-danger">
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </div>
  );
}
