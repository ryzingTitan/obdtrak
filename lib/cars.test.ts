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
import { getAllCars, createCar, updateCar, deleteCar } from "./cars";
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
  http.post("http://localhost:3001/api/cars", async ({ request }) => {
    const body = (await request.json()) as Partial<Car>;
    const newCar: Car = {
      id: "3",
      year: body.year || 2022,
      make: body.make || "",
      model: body.model || "",
    };
    return HttpResponse.json(newCar);
  }),
  http.put(
    "http://localhost:3001/api/cars/:id",
    async ({ request, params }) => {
      const body = (await request.json()) as Partial<Car>;
      const updatedCar: Car = {
        id: params.id as string,
        year: body.year || 2020,
        make: body.make || "",
        model: body.model || "",
      };
      return HttpResponse.json(updatedCar);
    },
  ),
  http.delete("http://localhost:3001/api/cars/:id", () => {
    return new HttpResponse(null, { status: 204 });
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

  describe("createCar", () => {
    it("should create a car successfully", async () => {
      const newCar: Partial<Car> = {
        year: 2022,
        make: "Ford",
        model: "Mustang",
      };

      const createdCar: Car = {
        id: "3",
        year: 2022,
        make: "Ford",
        model: "Mustang",
      };

      vi.mocked(fetchWithAuth).mockResolvedValue(createdCar);

      const result = await createCar("/cars", newCar);

      expect(fetchWithAuth).toHaveBeenCalledWith("/cars", {
        method: "POST",
        body: newCar,
      });
      expect(result).toEqual(createdCar);
    });

    it("should handle errors when creating a car fails", async () => {
      vi.mocked(fetchWithAuth).mockRejectedValue(new Error("Network error"));

      const newCar: Partial<Car> = {
        year: 2022,
        make: "Ford",
        model: "Mustang",
      };

      await expect(createCar("/cars", newCar)).rejects.toThrow(
        "Failed to create car",
      );
    });
  });

  describe("updateCar", () => {
    it("should update a car successfully", async () => {
      const patch: Partial<Car> = {
        make: "Toyota Updated",
      };

      const updatedCar: Car = {
        id: "1",
        year: 2020,
        make: "Toyota Updated",
        model: "Camry",
      };

      vi.mocked(fetchWithAuth).mockResolvedValue(updatedCar);

      const result = await updateCar("/cars", "1", patch);

      expect(fetchWithAuth).toHaveBeenCalledWith("/cars/1", {
        method: "PUT",
        body: patch,
      });
      expect(result).toEqual(updatedCar);
    });

    it("should handle errors when updating a car fails", async () => {
      vi.mocked(fetchWithAuth).mockRejectedValue(new Error("Network error"));

      const patch: Partial<Car> = {
        make: "Test Car",
      };

      await expect(updateCar("/cars", "1", patch)).rejects.toThrow(
        "Failed to update car",
      );
    });
  });

  describe("deleteCar", () => {
    it("should delete a car successfully", async () => {
      vi.mocked(fetchWithAuth).mockResolvedValue(undefined);

      await deleteCar("/cars", "1");

      expect(fetchWithAuth).toHaveBeenCalledWith("/cars/1", {
        method: "DELETE",
      });
    });

    it("should handle errors when deleting a car fails", async () => {
      vi.mocked(fetchWithAuth).mockRejectedValue(new Error("Network error"));

      await expect(deleteCar("/cars", "1")).rejects.toThrow(
        "Failed to delete car",
      );
    });
  });
});
