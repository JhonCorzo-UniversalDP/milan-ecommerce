import { describe, it, expect } from "vitest";
import { isValidEmail } from "./email";

describe("isValidEmail", () => {
  it("accepts standard emails", () => {
    for (const e of [
      "user@example.com",
      "first.last@sub.example.co",
      "name+tag@example.org",
      "a@b.cd",
    ]) {
      expect(isValidEmail(e), e).toBe(true);
    }
  });

  it("rejects invalid emails", () => {
    for (const e of [
      "",
      "   ",
      "no-at-sign",
      "missing@tld",
      "@example.com",
      "user@.com",
      "user@example",
      "user @example.com",
      "user@exa mple.com",
      " user@example.com",
      "user@example.com ",
    ]) {
      expect(isValidEmail(e), `should reject: "${e}"`).toBe(false);
    }
  });

  it("rejects non-string input", () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(123)).toBe(false);
  });
});
