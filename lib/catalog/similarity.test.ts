import { describe, it, expect } from "vitest";
import { similarityScore } from "./similarity";

describe("similarityScore", () => {
  it("returns 1 for identical strings", () => {
    expect(similarityScore("Cassette 10v", "Cassette 10v")).toBe(1);
  });

  it("returns 0 with no shared tokens", () => {
    expect(similarityScore("manzana freak", "tornillo allen")).toBe(0);
  });

  it("is case-insensitive", () => {
    expect(similarityScore("CASSETTE KMC", "cassette kmc")).toBe(1);
  });

  it("ignores accents", () => {
    expect(similarityScore("bicicleta montaña", "bicicleta montana")).toBe(1);
  });

  it("scores partial overlap between 0 and 1", () => {
    const s = similarityScore("cadena kmc 10v", "cadena shimano 11v");
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(1);
  });

  it("handles empty strings", () => {
    expect(similarityScore("", "anything")).toBe(0);
  });
});
