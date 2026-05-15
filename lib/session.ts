import { isValidEmail } from "./validation/email";

const STORAGE_KEY = "session.email";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getSession(): string | null {
  const s = storage();
  if (!s) return null;
  const value = s.getItem(STORAGE_KEY);
  return value && isValidEmail(value) ? value : null;
}

export function setSession(email: string): void {
  if (!isValidEmail(email)) {
    throw new Error("Invalid email");
  }
  const s = storage();
  if (!s) return;
  s.setItem(STORAGE_KEY, email);
}

export function clearSession(): void {
  const s = storage();
  if (!s) return;
  s.removeItem(STORAGE_KEY);
}
