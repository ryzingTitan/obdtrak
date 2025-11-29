import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCars } from "./useCars";
import { getAllCars } from "@/lib/cars";
import { Car } from "@/types/api";
import { SWRConfig } from "swr";
import React from "react";

vi.mock("@/lib/cars");

const mockCars: Car[] = [
  { id: "1", year: 2020, make: "Toyota", model: "Camry" },
  { id: "2", year: 2021, make: "Honda", model: "Civic" },
];

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    SWRConfig,
    { value: { dedupingInterval: 0, provider: () => new Map() } },
    children,
  );
};

describe("useCars", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAllCars).mockResolvedValue(mockCars);
  });

  it("should fetch cars on mount", async () => {
    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.cars).toEqual(mockCars);
    });

    expect(getAllCars).toHaveBeenCalledWith("/cars");
  });

  it("should set isLoading to true while fetching", () => {
    const { result } = renderHook(() => useCars(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it("should return empty array when no data is available", () => {
    vi.mocked(getAllCars).mockResolvedValue([]);

    const { result } = renderHook(() => useCars(), { wrapper });

    expect(result.current.cars).toEqual([]);
  });
});
