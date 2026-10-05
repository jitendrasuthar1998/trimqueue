import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a URL-safe slug from a business name */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 40);
}

/** Format INR currency */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format wait time into human-readable string */
export function formatWaitTime(mins: number): string {
  if (mins <= 0) return "Ready now!";
  if (mins < 60) return `~${mins} mins`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `~${h} hr${h > 1 ? "s" : ""}` : `~${h}h ${m}m`;
}

/** Check if business is currently open */
export function isBusinessOpen(timings: { open: string; close: string; offDays: string[] }): boolean {
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = dayNames[now.getDay()];

  if (timings.offDays.includes(todayName)) return false;

  const [openH, openM] = timings.open.split(":").map(Number);
  const [closeH, closeM] = timings.close.split(":").map(Number);

  const currentMins = now.getHours() * 60 + now.getMinutes();
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;

  return currentMins >= openMins && currentMins < closeMins;
}

/** Generate a random token color for visual distinction */
export function getTokenColor(tokenNumber: number): string {
  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-rose-500 to-pink-600",
  ];
  return colors[tokenNumber % colors.length];
}

/** Format phone number for display */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}
