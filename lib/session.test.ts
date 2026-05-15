import { describe, it, expect, beforeEach } from "vitest";
import { getSession, setSession, clearSession } from "./session";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() { return store.size; },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
  };
}

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    value: createMemoryStorage(),
    configurable: true,
  });
});

describe("session", () => {
  it("round-trips a valid email", () => {
    setSession("user@example.com");
    expect(getSession()).toBe("user@example.com");
  });

  it("clears session", () => {
    setSession("user@example.com");
    clearSession();
    expect(getSession()).toBeNull();
  });

  it("rejects invalid email", () => {
    expect(() => setSession("not-an-email")).toThrow();
    expect(getSession()).toBeNull();
  });

  it("returns null when storage is empty", () => {
    expect(getSession()).toBeNull();
  });

  it("returns null when stored value is corrupted (manual override)", () => {
    window.localStorage.setItem("session.email", "garbage");
    expect(getSession()).toBeNull();
  });
});
