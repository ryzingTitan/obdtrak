import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRecords } from "./useRecords";
import { getRecordsBySessionId } from "@/lib/records";
import { Record } from "@/types/api";
import { SWRConfig } from "swr";
import React from "react";

vi.mock("@/lib/records");

const mockRecords: Record[] = [
  {
    sessionId: 1,
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
    sessionId: 1,
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

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    SWRConfig,
    { value: { dedupingInterval: 0, provider: () => new Map() } },
    children,
  );
};

describe("useRecords", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRecordsBySessionId).mockResolvedValue(mockRecords);
  });

  it("should fetch records when sessionId is provided", async () => {
    const { result } = renderHook(() => useRecords("1"), { wrapper });

    await waitFor(() => {
      expect(result.current.records).toEqual(mockRecords);
    });

    expect(getRecordsBySessionId).toHaveBeenCalledWith("/sessions/1/records");
  });

  it("should not fetch records when sessionId is null", () => {
    const { result } = renderHook(() => useRecords(null), { wrapper });

    expect(result.current.records).toEqual([]);
    expect(getRecordsBySessionId).not.toHaveBeenCalled();
  });

  it("should set isLoading to true while fetching", () => {
    const { result } = renderHook(() => useRecords("1"), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it("should return empty array when no records are available", async () => {
    vi.mocked(getRecordsBySessionId).mockResolvedValue([]);

    const { result } = renderHook(() => useRecords("1"), { wrapper });

    await waitFor(() => {
      expect(result.current.records).toEqual([]);
    });
  });

  it("should handle errors gracefully", async () => {
    vi.mocked(getRecordsBySessionId).mockRejectedValue(
      new Error("Failed to fetch records"),
    );

    const { result } = renderHook(() => useRecords("1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.records).toEqual([]);
  });
});
