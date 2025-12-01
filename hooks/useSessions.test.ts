import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSessions } from "./useSessions";
import { getAllSessions } from "@/lib/sessions";
import { Session } from "@/types/api";
import { SWRConfig } from "swr";
import React from "react";

vi.mock("@/lib/sessions");

const mockSessions: Session[] = [
  {
    id: "1",
    startTime: "2024-01-15T10:00:00Z",
    endTime: "2024-01-15T11:00:00Z",
    trackName: "Laguna Seca",
    carYear: 2020,
    carMake: "Toyota",
    carModel: "Camry",
  },
  {
    id: "2",
    startTime: "2024-01-16T14:00:00Z",
    endTime: "2024-01-16T15:30:00Z",
    trackName: "Circuit of the Americas",
    carYear: 2021,
    carMake: "Honda",
    carModel: "Civic",
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    SWRConfig,
    { value: { dedupingInterval: 0, provider: () => new Map() } },
    children,
  );
};

describe("useSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAllSessions).mockResolvedValue(mockSessions);
  });

  it("should fetch sessions on mount", async () => {
    const { result } = renderHook(() => useSessions(), { wrapper });

    await waitFor(() => {
      expect(result.current.sessions).toEqual(mockSessions);
    });

    expect(getAllSessions).toHaveBeenCalledWith(
      "/sessions?userEmail=undefined",
    );
  });

  it("should set isLoading to true while fetching", () => {
    const { result } = renderHook(() => useSessions(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it("should return empty array when no sessions are available", async () => {
    vi.mocked(getAllSessions).mockResolvedValue([]);

    const { result } = renderHook(() => useSessions(), { wrapper });

    await waitFor(() => {
      expect(result.current.sessions).toEqual([]);
    });
  });

  it("should handle errors gracefully", async () => {
    vi.mocked(getAllSessions).mockRejectedValue(
      new Error("Failed to fetch sessions"),
    );

    const { result } = renderHook(() => useSessions(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.sessions).toEqual([]);
  });
});
