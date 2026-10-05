"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, Tag, Clock, IndianRupee } from "lucide-react";
import type { Business, ServiceItem } from "@/lib/types";
import { formatINR, formatWaitTime } from "@/lib/utils";

interface Props {
  business: Business;
  selected: ServiceItem[];
  onSelect: (services: ServiceItem[]) => void;
  onBack: () => void;
  onNext: () => void;
  totalPrice: number;
  totalDuration: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  Hair: "💇", Beard: "✂️", Skin: "✨", Massage: "💆",
  Nails: "💅", Consultation: "🩺", Other: "⭐",
};

export default function ServiceSelector({
  business, selected, onSelect, onBack, onNext, totalPrice, totalDuration,
}: Props) {
  const activeServices = business.services.filter((s) => s.isActive);
  const categories = Array.from(new Set(activeServices.map((s) => s.category)));
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered = activeCategory === "All"
    ? activeServices
    : activeServices.filter((s) => s.category === activeCategory);

  const isSelected = (id: string) => selected.some((s) => s.id === id);

  const toggle = (svc: ServiceItem) => {
    if (isSelected(svc.id)) {
      onSelect(selected.filter((s) => s.id !== svc.id));
    } else {
      onSelect([...selected, svc]);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-grid">
      {/* Nav */}
      <nav className="nav-bar">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm" style={{ color: "#8b8bad" }}>
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <span className="font-semibold text-sm">{business.name}</span>
          <span className="text-xs" style={{ color: "#8b8bad" }}>
            {selected.length} selected
          </span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto w-full px-4 flex-1 flex flex-col">
        <div className="py-4">
          <h1 className="text-2xl font-bold mb-1">Choose Services</h1>
          <p className="text-sm" style={{ color: "#8b8bad" }}>
            Select one or more services. We'll calculate your total time & cost.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <button
            onClick={() => setActiveCategory("All")}
            className={`category-chip flex-shrink-0 ${activeCategory === "All" ? "active" : ""}`}>
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`category-chip flex-shrink-0 ${activeCategory === cat ? "active" : ""}`}>
              {CATEGORY_ICONS[cat] || "⭐"} {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="flex-1 space-y-2 pb-40">
          {filtered.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p style={{ color: "#8b8bad" }}>No services in this category</p>
            </div>
          ) : (
            filtered.map((svc) => (
              <button
                key={svc.id}
                onClick={() => toggle(svc)}
                className={`service-card w-full text-left ${isSelected(svc.id) ? "selected" : ""}`}>
                <div className="flex items-center gap-3">
                  {/* Checkbox */}
                  <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center transition-all"
                    style={{
                      background: isSelected(svc.id) ? "#7c3aed" : "transparent",
                      border: isSelected(svc.id) ? "none" : "1px solid var(--qe-border)",
                    }}>
                    {isSelected(svc.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>

                  {/* Category icon */}
                  <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
                    style={{ background: "var(--qe-surface-2)" }}>
                    {CATEGORY_ICONS[svc.category] || "⭐"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{svc.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs flex items-center gap-1" style={{ color: "#8b8bad" }}>
                        <Clock className="w-3 h-3" /> {svc.durationMins} min
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm" style={{ color: "#a78bfa" }}>₹{svc.price}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Bottom Summary Bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <div className="max-w-lg mx-auto">
            <div className="bottom-sheet" style={{ borderRadius: "20px 20px 0 0" }}>
              {/* Services summary */}
              <div className="flex justify-between text-sm mb-4">
                <div>
                  <p className="font-semibold">{selected.length} service{selected.length > 1 ? "s" : ""}</p>
                  <p className="text-xs" style={{ color: "#8b8bad" }}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    ~{totalDuration} mins total
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs mb-0.5" style={{ color: "#8b8bad" }}>Total Amount</p>
                  <p className="text-2xl font-black gradient-text">₹{totalPrice}</p>
                </div>
              </div>
              <button onClick={onNext} className="btn-primary">
                Continue to Book Slot
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {selected.length === 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <div className="max-w-lg mx-auto">
            <div className="bottom-sheet" style={{ borderRadius: "20px 20px 0 0" }}>
              <p className="text-center text-sm" style={{ color: "#8b8bad" }}>
                Select at least one service to continue
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
