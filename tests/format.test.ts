import { describe, expect, it } from "vitest";
import { formatEv } from "../src/lib/format";

describe("formatEv", () => {
  it("prints one decimal with a true minus sign", () => {
    expect(formatEv(13.62)).toBe("EV 13.6");
    expect(formatEv(-2.5)).toBe("EV −2.5");
    expect(formatEv(0)).toBe("EV 0.0");
  });
  it("marks frames with no exposure data", () => {
    expect(formatEv(null)).toBe("EV —");
  });
});
