import { describe, it, expect } from "vitest";
import { getTempColor, getRpmColor } from "./telemetryUtils";

describe("telemetryUtils", () => {
  describe("getTempColor", () => {
    it("should return green for safe temperature (below 70% of max)", () => {
      const result = getTempColor(150, 220);
      expect(result).toBe("#4caf50");
    });

    it("should return orange for warm temperature (70-85% of max)", () => {
      const result = getTempColor(160, 220);
      expect(result).toBe("#ff9800");
    });

    it("should return red for hot temperature (above 85% of max)", () => {
      const result = getTempColor(190, 220);
      expect(result).toBe("#f44336");
    });

    it("should use default max of 220 when not provided", () => {
      const safeTemp = getTempColor(150);
      const warmTemp = getTempColor(160);
      const hotTemp = getTempColor(190);

      expect(safeTemp).toBe("#4caf50");
      expect(warmTemp).toBe("#ff9800");
      expect(hotTemp).toBe("#f44336");
    });

    it("should handle edge cases at threshold boundaries", () => {
      const max = 220;
      const threshold70 = max * 0.7; // 154
      const threshold85 = max * 0.85; // 187

      expect(getTempColor(threshold70 - 1, max)).toBe("#4caf50");
      expect(getTempColor(threshold70, max)).toBe("#ff9800");
      expect(getTempColor(threshold85 - 1, max)).toBe("#ff9800");
      expect(getTempColor(threshold85, max)).toBe("#f44336");
    });
  });

  describe("getRpmColor", () => {
    it("should return green for safe RPM (below 70% of redline)", () => {
      const result = getRpmColor(4000, 7000);
      expect(result).toBe("#4caf50");
    });

    it("should return orange for elevated RPM (70-90% of redline)", () => {
      const result = getRpmColor(5500, 7000);
      expect(result).toBe("#ff9800");
    });

    it("should return red for high RPM (above 90% of redline)", () => {
      const result = getRpmColor(6500, 7000);
      expect(result).toBe("#f44336");
    });

    it("should use default redline of 7000 when not provided", () => {
      const safeRpm = getRpmColor(4000);
      const elevatedRpm = getRpmColor(5500);
      const highRpm = getRpmColor(6500);

      expect(safeRpm).toBe("#4caf50");
      expect(elevatedRpm).toBe("#ff9800");
      expect(highRpm).toBe("#f44336");
    });

    it("should handle edge cases at threshold boundaries", () => {
      const redline = 7000;
      const threshold70 = redline * 0.7; // 4900
      const threshold90 = redline * 0.9; // 6300

      expect(getRpmColor(threshold70 - 1, redline)).toBe("#4caf50");
      expect(getRpmColor(threshold70, redline)).toBe("#ff9800");
      expect(getRpmColor(threshold90 - 1, redline)).toBe("#ff9800");
      expect(getRpmColor(threshold90, redline)).toBe("#f44336");
    });

    it("should handle different redline values", () => {
      const lowRedline = 5000;
      expect(getRpmColor(3000, lowRedline)).toBe("#4caf50");
      expect(getRpmColor(4000, lowRedline)).toBe("#ff9800");
      expect(getRpmColor(4700, lowRedline)).toBe("#f44336");
    });
  });
});
