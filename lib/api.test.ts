import { fetchWithAuth } from "./api";
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
} from "vitest";
import { auth0 } from "./auth0";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

process.env.API_BASE_URL = "http://localhost:3001/api";

const server = setupServer(
  http.get("http://localhost:3001/api/test", () => {
    return HttpResponse.json({ success: true });
  }),
  http.post("http://localhost:3001/api/test", () => {
    return HttpResponse.json({ success: true });
  }),
  http.put("http://localhost:3001/api/test", () => {
    return HttpResponse.json({ success: true });
  }),
  http.delete("http://localhost:3001/api/test", () => {
    return new HttpResponse(null, { status: 204 });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock("./auth0", () => ({
  auth0: {
    getSession: vi.fn(),
    getAccessToken: vi.fn(),
  },
  ensureValidSession: vi.fn(),
}));

describe("fetchWithAuth", () => {
  beforeEach(() => {
    vi.mocked(auth0.getAccessToken).mockResolvedValue({
      token: "test-access-token",
      expiresAt: Date.now() + 3600000,
    });
  });

  it("should make a GET request successfully", async () => {
    const data = await fetchWithAuth("/test");
    expect(data).toEqual({ success: true });
  });

  it("should make a POST request with a body successfully", async () => {
    const data = await fetchWithAuth("/test", {
      method: "POST",
      body: { message: "hello" },
    });
    expect(data).toEqual({ success: true });
  });

  it("should make a PUT request with a body successfully", async () => {
    const data = await fetchWithAuth("/test", {
      method: "PUT",
      body: { message: "hello" },
    });
    expect(data).toEqual({ success: true });
  });

  it("should make a DELETE request successfully", async () => {
    const data = await fetchWithAuth("/test", { method: "DELETE" });
    expect(data).toBeUndefined();
  });

  it("should handle query parameters", async () => {
    server.use(
      http.get("http://localhost:3001/api/test", ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("foo") === "bar") {
          return HttpResponse.json({ success: true });
        }
        return new HttpResponse(null, { status: 500 });
      }),
    );
    const data = await fetchWithAuth("/test", { params: { foo: "bar" } });
    expect(data).toEqual({ success: true });
  });

  it("should reject with an error if the fetch fails", async () => {
    server.use(
      http.get("http://localhost:3001/api/test", () => {
        return new HttpResponse(null, {
          status: 500,
          statusText: "Internal Server Error",
        });
      }),
    );
    await expect(fetchWithAuth("/test")).rejects.toThrow(
      "Request failed with status 500",
    );
  });

  it("should send FormData without Content-Type header", async () => {
    let receivedContentType: string | null = null;

    server.use(
      http.post("http://localhost:3001/api/test", ({ request }) => {
        receivedContentType = request.headers.get("content-type");
        return HttpResponse.json({ success: true });
      }),
    );

    const formData = new FormData();
    formData.append("file", new File(["content"], "test.txt"));
    formData.append("name", "test");

    await fetchWithAuth("/test", {
      method: "POST",
      body: formData,
    });

    expect(receivedContentType).toContain("multipart/form-data");
  });

  it("should send JSON with Content-Type header", async () => {
    let receivedContentType: string | null = null;

    server.use(
      http.post("http://localhost:3001/api/test", ({ request }) => {
        receivedContentType = request.headers.get("content-type");
        return HttpResponse.json({ success: true });
      }),
    );

    await fetchWithAuth("/test", {
      method: "POST",
      body: { message: "hello" },
    });

    expect(receivedContentType).toBe("application/json");
  });

  it("should handle empty response with content-length 0", async () => {
    server.use(
      http.post("http://localhost:3001/api/test", () => {
        return new HttpResponse(null, {
          status: 200,
          headers: {
            "content-length": "0",
          },
        });
      }),
    );

    const result = await fetchWithAuth("/test", { method: "POST" });
    expect(result).toBeUndefined();
  });

  it("should handle empty response without content-type", async () => {
    server.use(
      http.post("http://localhost:3001/api/test", () => {
        return new HttpResponse("", {
          status: 200,
        });
      }),
    );

    const result = await fetchWithAuth("/test", { method: "POST" });
    expect(result).toBeUndefined();
  });

  it("should handle response with non-JSON content-type", async () => {
    server.use(
      http.post("http://localhost:3001/api/test", () => {
        return new HttpResponse("plain text", {
          status: 200,
          headers: {
            "content-type": "text/plain",
          },
        });
      }),
    );

    const result = await fetchWithAuth("/test", { method: "POST" });
    expect(result).toBeUndefined();
  });
});
