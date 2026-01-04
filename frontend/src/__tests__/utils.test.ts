import { describe, test, expect } from "bun:test";
import { cn } from "@/lib/utils";

describe("Utils", () => {
  describe("cn", () => {
    test("merges class names", () => {
      expect(cn("px-2", "py-1")).toBe("px-2 py-1");
    });

    test("handles conditional classes", () => {
      expect(cn("base", true && "active", false && "disabled")).toBe("base active");
    });

    test("merges tailwind classes correctly", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });
  });
});
