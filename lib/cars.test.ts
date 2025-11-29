import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
import { getAllCars } from "./cars";
import { fetchWithAuth } from "./api";
import { Car } from "@/types/api";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

process.env.API_BASE_URL = "http://localhost:3001/api";

const mockCars: Car[] = [
  { id: "1", year: 2020, make: "Toyota", model: "Camry" },
  { id: "2", year: 2021, make: "Honda", model: "Civic" },
];

const server = setupServer(
  http.get("http://localhost:3001/api/cars", () => {
    return HttpResponse.json(mockCars);
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock("./auth0", () => ({
  auth0: {
    getSession: vi.fn(),
  },
  ensureValidSession: vi.fn(),
}));

vi.mock("./api");

describe("Cars Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllCars", () => {
    it("should fetch all cars successfully", async () => {
      vi.mocked(fetchWithAuth).mockResolvedValue(mockCars);

      const cars = await getAllCars("/cars");

      expect(fetchWithAuth).toHaveBeenCalledWith("/cars");
      expect(cars).toEqual(mockCars);
    });

    it("should handle errors when fetching cars fails", async () => {
      vi.mocked(fetchWithAuth).mockRejectedValue(new Error("Network error"));

      await expect(getAllCars("/cars")).rejects.toThrow("Failed to fetch cars");
    });
  });
});
