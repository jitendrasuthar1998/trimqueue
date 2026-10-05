// ─── Mock Data Store for Demo/Dev (without Firebase) ─────────────────────────
// This store simulates real-time behavior using localStorage + event emitters.
// In production, replace with Firestore subscriptions.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Business, Token, ServiceItem } from "./types";
import { generateSlug } from "./utils";

// ─── Default Demo Businesses ──────────────────────────────────────────────────
const DEMO_BUSINESSES: Business[] = [
  {
    id: "biz-demo-001",
    name: "Sharma's Premium Salon",
    slug: "sharmas-premium-salon",
    phone: "9876543210",
    ownerName: "Rajesh Sharma",
    address: "45, MG Road, Near City Mall",
    city: "Bangalore",
    landmark: "Opposite Central Park",
    bannerUrl: "",
    businessType: "salon",
    timings: { open: "09:00", close: "21:00", offDays: ["Sunday"] },
    currentServingToken: 3,
    nextTokenNumber: 8,
    isOpen: true,
    delayBufferMins: 0,
    services: [
      { id: "srv-1", name: "Men's Haircut", price: 150, durationMins: 30, category: "Hair", isActive: true },
      { id: "srv-2", name: "Beard Styling", price: 80, durationMins: 15, category: "Beard", isActive: true },
      { id: "srv-3", name: "Hair Color", price: 400, durationMins: 60, category: "Hair", isActive: true },
      { id: "srv-4", name: "Facial", price: 300, durationMins: 45, category: "Skin", isActive: true },
      { id: "srv-5", name: "Head Massage", price: 120, durationMins: 20, category: "Massage", isActive: true },
      { id: "srv-6", name: "Shave", price: 60, durationMins: 10, category: "Beard", isActive: true },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEMO_TOKENS: Token[] = [
  {
    id: "tok-1", bizId: "biz-demo-001", tokenNumber: 3, customerName: "Amit Kumar",
    customerPhone: "9876541234", services: ["srv-1"], serviceNames: ["Men's Haircut"],
    totalDurationMins: 30, totalAmount: 150, status: "serving", isLate: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "tok-2", bizId: "biz-demo-001", tokenNumber: 4, customerName: "Priya Singh",
    customerPhone: "9876541235", services: ["srv-2", "srv-4"], serviceNames: ["Beard Styling", "Facial"],
    totalDurationMins: 60, totalAmount: 380, status: "waiting", isLate: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "tok-3", bizId: "biz-demo-001", tokenNumber: 5, customerName: "Rahul Verma",
    customerPhone: "9876541236", services: ["srv-1", "srv-5"], serviceNames: ["Men's Haircut", "Head Massage"],
    totalDurationMins: 50, totalAmount: 270, status: "waiting", isLate: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "tok-4", bizId: "biz-demo-001", tokenNumber: 6, customerName: "Kavya Nair",
    customerPhone: "9876541237", services: ["srv-3"], serviceNames: ["Hair Color"],
    totalDurationMins: 60, totalAmount: 400, status: "waiting", isLate: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "tok-5", bizId: "biz-demo-001", tokenNumber: 7, customerName: "Demo User",
    customerPhone: "9999999999", services: ["srv-1", "srv-2"], serviceNames: ["Men's Haircut", "Beard Styling"],
    totalDurationMins: 45, totalAmount: 230, status: "waiting", isLate: false,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

// ─── App Store ────────────────────────────────────────────────────────────────
interface AppStore {
  // Auth / Vendor
  currentVendorId: string | null;
  setCurrentVendorId: (id: string | null) => void;

  // Businesses
  businesses: Business[];
  getBusinessBySlug: (slug: string) => Business | undefined;
  getBusinessById: (id: string) => Business | undefined;
  createBusiness: (data: Omit<Business, "id" | "createdAt" | "updatedAt">) => Business;
  updateBusiness: (id: string, data: Partial<Business>) => void;

  // Tokens
  tokens: Token[];
  getTokensForBiz: (bizId: string, statusFilter?: Token["status"][]) => Token[];
  getTokenById: (id: string) => Token | undefined;
  createToken: (data: Omit<Token, "id" | "createdAt" | "updatedAt">) => Token;
  updateToken: (id: string, data: Partial<Token>) => void;
  callNextToken: (bizId: string) => void;
  addDelayBuffer: (bizId: string, minutes: number) => void;
}

let tokenCounter = 100;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currentVendorId: null,
      setCurrentVendorId: (id) => set({ currentVendorId: id }),

      businesses: DEMO_BUSINESSES,

      getBusinessBySlug: (slug) => get().businesses.find((b) => b.slug === slug),
      getBusinessById: (id) => get().businesses.find((b) => b.id === id),

      createBusiness: (data) => {
        const id = `biz-${Date.now()}`;
        const slug = generateSlug(data.name);
        const biz: Business = {
          ...data,
          id,
          slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ businesses: [...s.businesses, biz] }));
        return biz;
      },

      updateBusiness: (id, data) => {
        set((s) => ({
          businesses: s.businesses.map((b) =>
            b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b
          ),
        }));
      },

      tokens: DEMO_TOKENS,

      getTokensForBiz: (bizId, statusFilter) => {
        const tokens = get().tokens.filter((t) => t.bizId === bizId);
        if (!statusFilter) return tokens;
        return tokens.filter((t) => statusFilter.includes(t.status));
      },

      getTokenById: (id) => get().tokens.find((t) => t.id === id),

      createToken: (data) => {
        const biz = get().getBusinessById(data.bizId);
        if (!biz) throw new Error("Business not found");
        const tokenNumber = biz.nextTokenNumber;
        const token: Token = {
          ...data,
          id: `tok-${Date.now()}-${++tokenCounter}`,
          tokenNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({
          tokens: [...s.tokens, token],
          businesses: s.businesses.map((b) =>
            b.id === data.bizId
              ? { ...b, nextTokenNumber: b.nextTokenNumber + 1 }
              : b
          ),
        }));
        return token;
      },

      updateToken: (id, data) => {
        set((s) => ({
          tokens: s.tokens.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      callNextToken: (bizId) => {
        const waitingTokens = get()
          .tokens.filter((t) => t.bizId === bizId && t.status === "waiting")
          .sort((a, b) => a.tokenNumber - b.tokenNumber);

        // Complete current serving token
        const serving = get().tokens.find((t) => t.bizId === bizId && t.status === "serving");
        if (serving) {
          get().updateToken(serving.id, { status: "completed" });
        }

        if (waitingTokens.length === 0) return;
        const next = waitingTokens[0];
        get().updateToken(next.id, { status: "serving" });
        get().updateBusiness(bizId, { currentServingToken: next.tokenNumber });
      },

      addDelayBuffer: (bizId, minutes) => {
        get().updateBusiness(bizId, {
          delayBufferMins: (get().getBusinessById(bizId)?.delayBufferMins || 0) + minutes,
        });
      },
    }),
    {
      name: "queueease-store",
      partialize: (state) => ({
        businesses: state.businesses,
        tokens: state.tokens,
        currentVendorId: state.currentVendorId,
      }),
    }
  )
);
