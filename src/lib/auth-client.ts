'use client';
export function getClientSession() {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("session");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveClientSession(session: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem("session", JSON.stringify(session));
}

export function signOutClient() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("session");
}

