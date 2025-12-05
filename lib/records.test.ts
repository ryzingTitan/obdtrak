import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRecordsBySessionId } from "./records";
import { fetchWithAuth } from "./api";
import { Record } from "@/types/api";
import { ApiError } from "./api-error";

process.env.API_BASE_URL = "http://localhost:3001/api";

const mockRecords: Record[] = [
  {
    sessionId: "1",
    timestamp: "2024-01-15T10:00:00Z",
    longitude: -121.7536,
    latitude: 36.5811,
    altitude: 100,
    intakeAirTemperature: 25,
    boostPressure: 1.5,
    coolantTemperature: 90,
    engineRpm: 3000,
    speed: 60,
    throttlePosition: 50,
    airFuelRatio: 14.7,
    oilPressure: 40,
    manifoldPressure: 1.2,
    massAirFlow: 10,
  },
  {
    sessionId: "1",
    timestamp: "2024-01-15T10:00:01Z",
    longitude: -121.7537,
    latitude: 36.5812,
    altitude: 101,
    intakeAirTemperature: 26,
    boostPressure: 1.6,
    coolantTemperature: 91,
    engineRpm: 3100,
    speed: 61,
    throttlePosition: 51,
    airFuelRatio: 14.8,
    oilPressure: 41,
    manifoldPressure: 1.3,
    massAirFlow: 11,
  },
];

vi.mock("./api");

describe("Records Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRecordsBySessionId", () => {
    it("should fetch records by session ID successfully", async () => {
      vi.mocked(fetchWithAuth).mockResolvedValue(mockRecords);

      const records = await getRecordsBySessionId("/api/sessions/1/records");

      expect(fetchWithAuth).toHaveBeenCalledWith("/api/sessions/1/records");
      expect(records).toEqual(mockRecords);
    });

    it("should handle errors when fetching records fails", async () => {
      vi.mocked(fetchWithAuth).mockRejectedValue(new Error("Network error"));

      await expect(
        getRecordsBySessionId("/api/sessions/1/records"),
      ).rejects.toThrow("Failed to fetch records");
    });

    it("should handle ApiError specifically", async () => {
      const apiError = new ApiError("API Error", 404, "Not Found");
      vi.mocked(fetchWithAuth).mockRejectedValue(apiError);

      await expect(
        getRecordsBySessionId("/api/sessions/1/records"),
      ).rejects.toThrow(apiError);
    });
  });
});
