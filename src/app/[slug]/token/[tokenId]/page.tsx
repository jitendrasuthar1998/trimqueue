"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scissors, Clock, ChevronLeft, Users, Zap, CheckCircle2,
  XCircle, AlertTriangle, Phone, Loader2, Share2, Home,
  RefreshCw, Timer,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { Token, Business } from "@/lib/types";
import { formatWaitTime, getTokenColor } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string; tokenId: string }>;
};

// ─── Wait time estimation ─────────────────────────────────────────────────────
function calcWaitMins(tokens: Token[], myTokenNumber: number, delayBuffer: number): { position: number; waitMins: number } {
  const ahead = tokens
    .filter((t) => ["waiting", "serving"].includes(t.status) && t.tokenNumber <= myTokenNumber)
    .sort((a, b) => a.tokenNumber - b.tokenNumber);

  // Exclude self
  const tokensAheadOfMe = ahead.filter((t) => t.tokenNumber < myTokenNumber);
  const servingToken = tokens.find((t) => t.status === "serving");

  // Half of serving's duration remains
  const servingRemaining = servingToken && servingToken.tokenNumber < myTokenNumber
    ? Math.ceil(servingToken.totalDurationMins * 0.6) : 0;

  const waitingMins = tokensAheadOfMe
    .filter((t) => t.status === "waiting")
    .reduce((sum, t) => sum + t.totalDurationMins, 0);

  return {
    position: tokensAheadOfMe.length,
    waitMins: servingRemaining + waitingMins + delayBuffer,
  };
}

export default function TokenTrackerPage({ params }: PageProps) {
  const { slug, tokenId } = use(params);
  const router = useRouter();
  const { tokens, businesses, updateToken } = useAppStore();

  const [showCancel, setShowCancel] = useState(false);
  const [showLate, setShowLate] = useState(false);
  const [tick, setTick] = useState(0);

  // Refresh every 5 seconds to simulate real-time
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const token = tokens.find((t) => t.id === tokenId);
  const business = token ? businesses.find((b) => b.id === token.bizId) : null;

  const bizTokens = token && business
    ? tokens.filter((t) => t.bizId === business.id)
    : [];

  if (!token || !business) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center text-center p-4">
        <div className="glass-card p-8 max-w-sm w-full">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: "#fbbf24" }} />
          <h2 className="text-xl font-bold mb-2">Token Not Found</h2>
          <p className="mb-6" style={{ color: "#8b8bad" }}>
            This token may have expired or been cancelled.
          </p>
          <Link href={`/${slug}`} className="btn-primary">Back to Queue</Link>
        </div>
      </div>
    );
  }

  const { position, waitMins } = calcWaitMins(bizTokens, token.tokenNumber, business.delayBufferMins);
  const servingToken = bizTokens.find((t) => t.status === "serving");
  const currentServing = servingToken?.tokenNumber || business.currentServingToken;
  const waitingCount = bizTokens.filter((t) => t.status === "waiting").length;

  const isServing = token.status === "serving";
  const isCompleted = token.status === "completed";
  const isCancelled = token.status === "cancelled";
  const isDone = isCompleted || isCancelled;

  const gradient = getTokenColor(token.tokenNumber);

  // Progress: from 0 to 100 as token moves closer
  const totalInitialWaiting = bizTokens.filter((t) => t.bizId === business.id).length;
  const progressPct = isServing ? 95
    : isCompleted ? 100
    : isCancelled ? 0
    : Math.max(5, Math.min(90, ((totalInitialWaiting - position) / Math.max(1, totalInitialWaiting)) * 90));

  const handleCancel = () => {
    updateToken(token.id, { status: "cancelled" });
    setShowCancel(false);
  };

  const handleLate = () => {
    updateToken(token.id, { isLate: true });
    setShowLate(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `My token at ${business.name}`, url });
    } else {
      navigator.clipboard?.writeText(url);
    }
  };

  return (
    <div className="min-h-dvh bg-grid flex flex-col">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${gradient}`} />
      </div>

      {/* Nav */}
      <nav className="nav-bar">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/${slug}`} className="flex items-center gap-1.5 text-sm" style={{ color: "#8b8bad" }}>
            <ChevronLeft className="w-4 h-4" /> {business.name}
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="btn-icon">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 flex flex-col">
        {/* ── Status Header ── */}
        <div className="text-center mb-6 animate-slide-up">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#8b8bad" }}>
            Your Queue Ticket
          </p>

          {/* Big Token Number */}
          <div className="relative inline-block mb-4">
            <div className={`w-36 h-36 rounded-3xl bg-gradient-to-br ${gradient} flex flex-col items-center justify-center mx-auto
              ${isServing ? "glow-success animate-float" : ""}`}
              style={isServing ? { boxShadow: "0 0 60px rgba(16,185,129,0.4)" } : {}}>
              <span className="text-xs font-semibold opacity-70 mb-1">TOKEN</span>
              <span className="text-5xl font-black text-white">#{token.tokenNumber}</span>
            </div>
            {/* Pulse ring when serving */}
            {isServing && (
              <div className="absolute inset-0 rounded-3xl border-2 border-green-400 animate-ping opacity-30" />
            )}
          </div>

          {/* Status Message */}
          {isServing && (
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-bold text-sm" style={{ color: "#34d399" }}>
                  🎉 It's Your Turn! Please come in.
                </span>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2"
              style={{ background: "rgba(100,116,139,0.15)", border: "1px solid rgba(100,116,139,0.3)" }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: "#94a3b8" }} />
              <span className="text-sm" style={{ color: "#94a3b8" }}>Session Completed. Thank you!</span>
            </div>
          )}

          {isCancelled && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2"
              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <XCircle className="w-4 h-4" style={{ color: "#f87171" }} />
              <span className="text-sm" style={{ color: "#f87171" }}>Token Cancelled</span>
            </div>
          )}

          {!isDone && !isServing && (
            <p className="text-2xl font-bold">
              {position === 0 ? "You're next! 🎯" : `${position} ahead of you`}
            </p>
          )}
        </div>

        {/* ── Live Stats ── */}
        {!isDone && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="glass-card p-3 text-center">
              <div className="text-xl font-black gradient-text">{currentServing || "—"}</div>
              <div className="text-xs mt-0.5" style={{ color: "#8b8bad" }}>Serving Now</div>
            </div>
            <div className="glass-card p-3 text-center">
              <div className="text-xl font-black" style={{ color: "#a78bfa" }}>#{token.tokenNumber}</div>
              <div className="text-xs mt-0.5" style={{ color: "#8b8bad" }}>Your Token</div>
            </div>
            <div className="glass-card p-3 text-center">
              <div className="text-xl font-black" style={{ color: "#fbbf24" }}>
                {isServing ? "Now!" : formatWaitTime(waitMins)}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#8b8bad" }}>Wait Time</div>
            </div>
          </div>
        )}

        {/* ── Progress Bar ── */}
        {!isDone && (
          <div className="glass-card p-4 mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium" style={{ color: "#8b8bad" }}>Queue Progress</span>
              <span className="text-xs font-bold" style={{ color: "#a78bfa" }}>{Math.round(progressPct)}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            {!isServing && (
              <p className="text-xs mt-2 text-center" style={{ color: "#8b8bad" }}>
                {waitingCount} customers in queue · Est. {formatWaitTime(waitMins)}
              </p>
            )}
          </div>
        )}

        {/* ── Booking Summary ── */}
        <div className="glass-card p-4 mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#8b8bad" }}>
            Your Services
          </p>
          <div className="space-y-2">
            {token.serviceNames.map((name, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm">{name}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3" style={{ borderColor: "var(--qe-border)" }}>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="font-bold text-sm" style={{ color: "#a78bfa" }}>₹{token.totalAmount}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: "#8b8bad" }}>Est. Duration</span>
              <span className="text-xs" style={{ color: "#8b8bad" }}>{token.totalDurationMins} mins</span>
            </div>
          </div>
        </div>

        {/* ── Customer Info ── */}
        <div className="glass-card p-4 mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#8b8bad" }}>Customer</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold"
              style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>
              {token.customerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{token.customerName}</p>
              <p className="text-sm" style={{ color: "#8b8bad" }}>+91 {token.customerPhone}</p>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        {!isDone && (
          <div className="space-y-3 mt-auto">
            {!isServing && !token.isLate && (
              <button onClick={() => setShowLate(true)} className="btn-secondary">
                <Timer className="w-4 h-4" />
                I'm Running Late
              </button>
            )}
            {token.isLate && (
              <div className="glass-card p-3 flex items-center gap-2"
                style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.05)" }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#fbbf24" }} />
                <p className="text-sm" style={{ color: "#fbbf24" }}>Running Late — the shop knows!</p>
              </div>
            )}
            {!isServing && (
              <button onClick={() => setShowCancel(true)} className="btn-danger">
                <XCircle className="w-4 h-4" />
                Cancel My Token
              </button>
            )}
          </div>
        )}

        {isDone && (
          <div className="space-y-3 mt-auto">
            <Link href={`/${slug}`} className="btn-primary">
              <RefreshCw className="w-4 h-4" />
              Book Another Token
            </Link>
            <Link href="/" className="btn-secondary">
              <Home className="w-4 h-4" />
              Go to Home
            </Link>
          </div>
        )}

        {/* Live indicator */}
        {!isDone && (
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs" style={{ color: "#4a4a6a" }}>
              Live updates every few seconds
            </span>
          </div>
        )}
      </main>

      {/* Cancel Confirm Modal */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && setShowCancel(false)}>
          <div className="bottom-sheet sm:relative sm:rounded-2xl sm:max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.15)" }}>
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold">Cancel Token?</h3>
                <p className="text-xs" style={{ color: "#8b8bad" }}>This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm mb-5" style={{ color: "#c4b5fd" }}>
              Are you sure you want to cancel Token #{token.tokenNumber}?
              You'll lose your spot in the queue.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowCancel(false)} className="btn-secondary">Keep it</button>
              <button onClick={handleCancel} className="btn-danger">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Late Notification Modal */}
      {showLate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && setShowLate(false)}>
          <div className="bottom-sheet sm:relative sm:rounded-2xl sm:max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(245,158,11,0.15)" }}>
                <Timer className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold">Notify Running Late?</h3>
                <p className="text-xs" style={{ color: "#8b8bad" }}>The shop will be notified</p>
              </div>
            </div>
            <p className="text-sm mb-5" style={{ color: "#c4b5fd" }}>
              We'll mark your token as "Running Late" so the salon knows. Your token won't be cancelled.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowLate(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleLate}
                className="btn-primary" style={{ background: "linear-gradient(135deg,#d97706,#f59e0b)" }}>
                <AlertTriangle className="w-4 h-4" />
                Notify Shop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
