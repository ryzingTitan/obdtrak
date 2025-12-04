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
import { getAllTracks, createTrack, updateTrack, deleteTrack } from "./tracks";
import { fetchWithAuth } from "./api";
import Track from "@/types/api";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { ApiError } from "./api-error";

process.env.API_BASE_URL = "http://localhost:3001/api";

const mockTracks: Track[] = [
  { id: "1", name: "Laguna Seca", latitude: 36.5844, longitude: -121.7538 },
  {
    id: "2",
    name: "Circuit of the Americas",
    latitude: 30.1328,
    longitude: -97.6411,
  },
];

const server = setupServer(
  http.get("http://localhost:3001/api/tracks", () => {
    return HttpResponse.json(mockTracks);
  }),
  http.post("http://localhost:3001/api/tracks", async ({ request }) => {
    const body = (await request.json()) as Partial<Track>;
    const newTrack: Track = {
      id: "3",
      name: body.name || "",
      latitude: body.latitude || 0,
      longitude: body.longitude || 0,
    };
    return HttpResponse.json(newTrack);
  }),
  http.put(
    "http://localhost:3001/api/tracks/:id",
    async ({ request, params }) => {
      const body = (await request.json()) as Partial<Track>;
      const updatedTrack: Track = {
        id: params.id as string,
        name: body.name || "",
        latitude: body.latitude || 0,
        longitude: body.longitude || 0,
      };
      return HttpResponse.json(updatedTrack);
    },
  ),
  http.delete("http://localhost:3001/api/tracks/:id", () => {
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

describe("Tracks Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllTracks", () => {
    it("should fetch all tracks successfully", async () => {
      vi.mocked(fetchWithAuth).mockResolvedValue(mockTracks);

      const tracks = await getAllTracks("/tracks");

      expect(fetchWithAuth).toHaveBeenCalledWith("/tracks");
      expect(tracks).toEqual(mockTracks);
    });

    it("should handle errors when fetching tracks fails", async () => {
      vi.mocked(fetchWithAuth).mockRejectedValue(new Error("Network error"));

      await expect(getAllTracks("/tracks")).rejects.toThrow(
        "Failed to fetch tracks",
      );
    });

    it("should handle ApiError specifically", async () => {
      const apiError = new ApiError("API Error", 500, "Internal Server Error");
      vi.mocked(fetchWithAuth).mockRejectedValue(apiError);

      await expect(getAllTracks("/tracks")).rejects.toThrow(apiError);
    });
  });

  describe("createTrack", () => {
    it("should create a track successfully", async () => {
      const newTrack: Partial<Track> = {
        name: "Nürburgring",
        latitude: 50.3356,
        longitude: 6.9475,
      };

      const createdTrack: Track = {
        id: "3",
        name: "Nürburgring",
        latitude: 50.3356,
        longitude: 6.9475,
      };

      vi.mocked(fetchWithAuth).mockResolvedValue(createdTrack);

      const result = await createTrack("/tracks", newTrack);

      expect(fetchWithAuth).toHaveBeenCalledWith("/tracks", {
        method: "POST",
        body: newTrack,
      });
      expect(result).toEqual(createdTrack);
    });

    it("should handle errors when creating a track fails", async () => {
      vi.mocked(fetchWithAuth).mockRejectedValue(new Error("Network error"));

      const newTrack: Partial<Track> = {
        name: "Test Track",
        latitude: 0,
        longitude: 0,
      };

      await expect(createTrack("/tracks", newTrack)).rejects.toThrow(
        "Failed to create track",
      );
    });

    it("should handle ApiError specifically", async () => {
      const apiError = new ApiError("API Error", 400, "Bad Request");
      vi.mocked(fetchWithAuth).mockRejectedValue(apiError);

      const newTrack: Partial<Track> = {
        name: "Test Track",
        latitude: 0,
        longitude: 0,
      };

      await expect(createTrack("/tracks", newTrack)).rejects.toThrow(apiError);
    });
  });

  describe("updateTrack", () => {
    it("should update a track successfully", async () => {
      const patch: Partial<Track> = {
        name: "Laguna Seca Updated",
      };

      const updatedTrack: Track = {
        id: "1",
        name: "Laguna Seca Updated",
        latitude: 36.5844,
        longitude: -121.7538,
      };

      vi.mocked(fetchWithAuth).mockResolvedValue(updatedTrack);

      const result = await updateTrack("/tracks", "1", patch);

      expect(fetchWithAuth).toHaveBeenCalledWith("/tracks/1", {
        method: "PUT",
        body: patch,
      });
      expect(result).toEqual(updatedTrack);
    });

    it("should handle errors when updating a track fails", async () => {
      vi.mocked(fetchWithAuth).mockRejectedValue(new Error("Network error"));

      const patch: Partial<Track> = {
        name: "Test Track",
      };

      await expect(updateTrack("/tracks", "1", patch)).rejects.toThrow(
        "Failed to update track",
      );
    });

    it("should handle ApiError specifically", async () => {
      const apiError = new ApiError("API Error", 404, "Not Found");
      vi.mocked(fetchWithAuth).mockRejectedValue(apiError);

      const patch: Partial<Track> = {
        name: "Test Track",
      };

      await expect(updateTrack("/tracks", "1", patch)).rejects.toThrow(
        apiError,
      );
    });
  });

  describe("deleteTrack", () => {
    it("should delete a track successfully", async () => {
      vi.mocked(fetchWithAuth).mockResolvedValue(undefined);

      await deleteTrack("/tracks", "1");

      expect(fetchWithAuth).toHaveBeenCalledWith("/tracks/1", {
        method: "DELETE",
      });
    });

    it("should handle errors when deleting a track fails", async () => {
      vi.mocked(fetchWithAuth).mockRejectedValue(new Error("Network error"));

      await expect(deleteTrack("/tracks", "1")).rejects.toThrow(
        "Failed to delete track",
      );
    });

    it("should handle ApiError specifically", async () => {
      const apiError = new ApiError("API Error", 403, "Forbidden");
      vi.mocked(fetchWithAuth).mockRejectedValue(apiError);

      await expect(deleteTrack("/tracks", "1")).rejects.toThrow(apiError);
    });
  });
});
