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
import { getAllSessions, createSessions } from "./sessions";
import { fetchWithAuth } from "./api";
import { Session, SessionData } from "@/types/api";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { auth0 } from "./auth0";

process.env.API_BASE_URL = "http://localhost:3001/api";

const mockSessions: Session[] = [
  {
    id: "1",
    startTime: "2024-01-15T10:00:00Z",
    endTime: "2024-01-15T11:00:00Z",
    trackName: "Laguna Seca",
    trackLatitude: 36.5844,
    trackLongitude: -121.7544,
    carYear: 2020,
    carMake: "Toyota",
    carModel: "Camry",
  },
  {
    id: "2",
    startTime: "2024-01-16T14:00:00Z",
    endTime: "2024-01-16T15:30:00Z",
    trackName: "Circuit of the Americas",
    trackLatitude: 30.1328,
    trackLongitude: -97.6411,
    carYear: 2021,
    carMake: "Honda",
    carModel: "Civic",
  },
];

const server = setupServer(
  http.get("http://localhost:3001/api/sessions", () => {
    return HttpResponse.json(mockSessions);
  }),
  http.post("http://localhost:3001/api/sessions", () => {
    return new HttpResponse(null, { status: 201 });
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

describe("Sessions Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllSessions", () => {
    it("should fetch all sessions successfully", async () => {
      vi.mocked(fetchWithAuth).mockResolvedValue(mockSessions);

      const sessions = await getAllSessions("/sessions");

      expect(fetchWithAuth).toHaveBeenCalledWith("/sessions");
      expect(sessions).toEqual(mockSessions);
    });

    it("should handle errors when fetching sessions fails", async () => {
      vi.mocked(fetchWithAuth).mockRejectedValue(new Error("Network error"));

      await expect(getAllSessions("/sessions")).rejects.toThrow(
        "Failed to fetch sessions",
      );
    });
  });

  describe("createSessions", () => {
    it("should create a session successfully with user data", async () => {
      const mockSession = {
        user: {
          email: "test@example.com",
          name: "John Doe",
        },
      };

      vi.mocked(auth0.getSession).mockResolvedValue(mockSession);
      vi.mocked(fetchWithAuth).mockResolvedValue(undefined);

      const sessionData: SessionData = {
        carId: "car123",
        trackId: "track456",
      };

      await createSessions("/sessions", sessionData);

      expect(auth0.getSession).toHaveBeenCalled();
      expect(fetchWithAuth).toHaveBeenCalledWith("/sessions", {
        method: "POST",
        body: expect.any(FormData),
      });

      const formData = vi.mocked(fetchWithAuth).mock.calls[0][1]
        ?.body as FormData;
      expect(formData.get("carId")).toBe("car123");
      expect(formData.get("trackId")).toBe("track456");
      expect(formData.get("userEmail")).toBe("test@example.com");
      expect(formData.get("userFirstName")).toBe("John");
      expect(formData.get("userLastName")).toBe("Doe");
    });

    it("should handle user with single name", async () => {
      const mockSession = {
        user: {
          email: "test@example.com",
          name: "John",
        },
      };

      vi.mocked(auth0.getSession).mockResolvedValue(mockSession);
      vi.mocked(fetchWithAuth).mockResolvedValue(undefined);

      const sessionData: SessionData = {
        carId: "car123",
        trackId: "track456",
      };

      await createSessions("/sessions", sessionData);

      const formData = vi.mocked(fetchWithAuth).mock.calls[0][1]
        ?.body as FormData;
      expect(formData.get("userFirstName")).toBe("John");
      expect(formData.get("userLastName")).toBe("");
    });

    it("should handle missing user email", async () => {
      const mockSession = {
        user: {
          name: "John Doe",
        },
      };

      vi.mocked(auth0.getSession).mockResolvedValue(mockSession);
      vi.mocked(fetchWithAuth).mockResolvedValue(undefined);

      const sessionData: SessionData = {
        carId: "car123",
        trackId: "track456",
      };

      await createSessions("/sessions", sessionData);

      const formData = vi.mocked(fetchWithAuth).mock.calls[0][1]
        ?.body as FormData;
      expect(formData.get("userEmail")).toBe("");
    });

    it("should handle missing user name", async () => {
      const mockSession = {
        user: {
          email: "test@example.com",
        },
      };

      vi.mocked(auth0.getSession).mockResolvedValue(mockSession);
      vi.mocked(fetchWithAuth).mockResolvedValue(undefined);

      const sessionData: SessionData = {
        carId: "car123",
        trackId: "track456",
      };

      await createSessions("/sessions", sessionData);

      const formData = vi.mocked(fetchWithAuth).mock.calls[0][1]
        ?.body as FormData;
      expect(formData.get("userFirstName")).toBe("");
      expect(formData.get("userLastName")).toBe("");
    });

    it("should handle null session", async () => {
      vi.mocked(auth0.getSession).mockResolvedValue(null);
      vi.mocked(fetchWithAuth).mockResolvedValue(undefined);

      const sessionData: SessionData = {
        carId: "car123",
        trackId: "track456",
      };

      await createSessions("/sessions", sessionData);

      const formData = vi.mocked(fetchWithAuth).mock.calls[0][1]
        ?.body as FormData;
      expect(formData.get("userEmail")).toBe("");
      expect(formData.get("userFirstName")).toBe("");
      expect(formData.get("userLastName")).toBe("");
    });

    it("should handle errors when creating a session fails", async () => {
      const mockSession = {
        user: {
          email: "test@example.com",
          name: "John Doe",
        },
      };

      vi.mocked(auth0.getSession).mockResolvedValue(mockSession);
      vi.mocked(fetchWithAuth).mockRejectedValue(new Error("Network error"));

      const sessionData: SessionData = {
        carId: "car123",
        trackId: "track456",
      };

      await expect(createSessions("/sessions", sessionData)).rejects.toThrow(
        "Failed to create sessions",
      );
    });
  });
});
