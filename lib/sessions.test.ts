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
import { getAllSessions } from "./sessions";
import { fetchWithAuth } from "./api";
import { Session } from "@/types/api";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

process.env.API_BASE_URL = "http://localhost:3001/api";

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

const server = setupServer(
  http.get("http://localhost:3001/api/sessions", () => {
    return HttpResponse.json(mockSessions);
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
});
