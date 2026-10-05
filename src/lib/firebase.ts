// ─── Firebase Configuration & Firestore Helpers ─────────────────────────────
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import type { Business, Token, ServiceItem } from "./types";

// ─── Firebase Config (Replace with your project config) ────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:demo",
};

// Initialize Firebase (prevent re-init in Next.js hot-reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);

// ─── Collections ─────────────────────────────────────────────────────────────
export const businessesCol = () => collection(db, "businesses");
export const tokensCol = () => collection(db, "tokens");

// ─── Business Helpers ────────────────────────────────────────────────────────

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const q = query(businessesCol(), where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Business;
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const snap = await getDoc(doc(db, "businesses", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Business;
}

export async function createBusiness(data: Omit<Business, "id">): Promise<string> {
  const ref = doc(businessesCol());
  await setDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBusiness(id: string, data: Partial<Business>): Promise<void> {
  await updateDoc(doc(db, "businesses", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToBusiness(id: string, cb: (biz: Business | null) => void) {
  return onSnapshot(doc(db, "businesses", id), (snap) => {
    if (!snap.exists()) return cb(null);
    cb({ id: snap.id, ...snap.data() } as Business);
  });
}

export function subscribeToBusinessBySlug(slug: string, cb: (biz: Business | null) => void) {
  const q = query(businessesCol(), where("slug", "==", slug));
  return onSnapshot(q, (snap) => {
    if (snap.empty) return cb(null);
    const d = snap.docs[0];
    cb({ id: d.id, ...d.data() } as Business);
  });
}

// ─── Token Helpers ───────────────────────────────────────────────────────────

export async function createToken(data: Omit<Token, "id">): Promise<string> {
  const ref = await addDoc(tokensCol(), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // Increment nextTokenNumber on business doc
  await updateDoc(doc(db, "businesses", data.bizId), {
    nextTokenNumber: increment(1),
  });
  return ref.id;
}

export async function updateTokenStatus(
  tokenId: string,
  status: Token["status"],
  bizId?: string
): Promise<void> {
  await updateDoc(doc(db, "tokens", tokenId), {
    status,
    updatedAt: serverTimestamp(),
  });
  // If serving — advance the currentServingToken on business doc
  if (status === "serving" && bizId) {
    const tokenSnap = await getDoc(doc(db, "tokens", tokenId));
    if (tokenSnap.exists()) {
      const tokenData = tokenSnap.data() as Token;
      await updateDoc(doc(db, "businesses", bizId), {
        currentServingToken: tokenData.tokenNumber,
      });
    }
  }
}

export async function callNextToken(bizId: string): Promise<void> {
  // Find the lowest waiting token
  const q = query(
    tokensCol(),
    where("bizId", "==", bizId),
    where("status", "==", "waiting"),
    orderBy("tokenNumber", "asc")
  );
  const snap = await getDocs(q);
  if (snap.empty) return;

  const nextToken = snap.docs[0];
  await updateDoc(doc(db, "tokens", nextToken.id), {
    status: "serving",
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "businesses", bizId), {
    currentServingToken: nextToken.data().tokenNumber,
  });
}

export function subscribeToTokens(bizId: string, cb: (tokens: Token[]) => void) {
  const q = query(
    tokensCol(),
    where("bizId", "==", bizId),
    where("status", "in", ["waiting", "serving"]),
    orderBy("tokenNumber", "asc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Token)));
  });
}

export function subscribeToToken(tokenId: string, cb: (token: Token | null) => void) {
  return onSnapshot(doc(db, "tokens", tokenId), (snap) => {
    if (!snap.exists()) return cb(null);
    cb({ id: snap.id, ...snap.data() } as Token);
  });
}

export async function getWaitingTokensAhead(bizId: string, tokenNumber: number): Promise<Token[]> {
  const q = query(
    tokensCol(),
    where("bizId", "==", bizId),
    where("status", "in", ["waiting", "serving"]),
    where("tokenNumber", "<", tokenNumber),
    orderBy("tokenNumber", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Token));
}
