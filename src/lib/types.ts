// ─── QueueEase Type Definitions ─────────────────────────────────────────────

export type TokenStatus = "waiting" | "serving" | "completed" | "cancelled" | "late";

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  durationMins: number;
  category: string;
  isActive: boolean;
}

export interface BusinessTimings {
  open: string;     // "09:00"
  close: string;    // "21:00"
  offDays: string[]; // ["Sunday", "Tuesday"]
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  phone: string;
  ownerName: string;
  address: string;
  city: string;
  landmark?: string;
  bannerUrl?: string;
  businessType: "salon" | "barber" | "clinic" | "spa" | "other";
  timings: BusinessTimings;
  currentServingToken: number;
  nextTokenNumber: number;
  services: ServiceItem[];
  isOpen: boolean;
  delayBufferMins: number; // Emergency delay added to all pending
  createdAt: string;
  updatedAt: string;
}

export interface Token {
  id: string;
  bizId: string;
  tokenNumber: number;
  customerName: string;
  customerPhone: string;
  services: string[]; // service IDs
  serviceNames: string[];
  totalDurationMins: number;
  totalAmount: number;
  status: TokenStatus;
  isLate: boolean;
  createdAt: string;
  updatedAt: string;
}

// Computed view model for customer token tracker
export interface TokenTrackerInfo {
  token: Token;
  business: Business;
  currentServing: number;
  position: number;       // How many tokens ahead of this one
  estimatedWaitMins: number;
  waitingCount: number;
}
