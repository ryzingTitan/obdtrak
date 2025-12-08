import { describe, it, expect, vi } from "vitest";
import Home from "./page";

const mockRedirect = vi.fn();
const mockGetSession = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

vi.mock("@/lib/auth0", () => ({
  auth0: {
    getSession: () => mockGetSession(),
  },
  loginUrl: "/api/auth/login",
}));

describe("Home Page", () => {
  it("should redirect to login when session is null", async () => {
    mockGetSession.mockResolvedValue(null);

    await Home();

    expect(mockRedirect).toHaveBeenCalledWith("/api/auth/login");
  });

  it("should redirect to analytics when session exists", async () => {
    mockGetSession.mockResolvedValue({
      user: { sub: "123", name: "Test User" },
    });

    await Home();

    expect(mockRedirect).toHaveBeenCalledWith("/analytics");
  });

  it("should redirect to login when session is undefined", async () => {
    mockGetSession.mockResolvedValue(undefined);

    await Home();

    expect(mockRedirect).toHaveBeenCalledWith("/api/auth/login");
  });
});
