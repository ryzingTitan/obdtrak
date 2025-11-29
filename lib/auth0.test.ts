import { isIdTokenExpired, ensureValidSession, loginUrl } from "./auth0";
import { describe, it, expect, vi } from "vitest";
import { redirect } from "next/navigation";
import { beforeEach } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("isIdTokenExpired", () => {
  it("should return true for an expired token", () => {
    const expiredToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDk0NTkyMDB9.test"; // Expired
    expect(isIdTokenExpired(expiredToken)).toBe(true);
  });

  it("should return false for a valid token", () => {
    const validToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE5MjQ5OTIwMDB9.test"; // Not expired
    expect(isIdTokenExpired(validToken)).toBe(false);
  });

  it("should return true for a token without an expiry", () => {
    const noExpiryToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.test";
    expect(isIdTokenExpired(noExpiryToken)).toBe(true);
  });

  it("should return true for an invalid token", () => {
    expect(isIdTokenExpired("invalid-token")).toBe(true);
  });

  it("should return true for an undefined token", () => {
    expect(isIdTokenExpired(undefined)).toBe(true);
  });

  it("should return true for a malformed token that throws during parsing", () => {
    const malformedToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.!!!invalid!!!.test";
    expect(isIdTokenExpired(malformedToken)).toBe(true);
  });
});

describe("ensureValidSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should redirect to login if session is null", () => {
    ensureValidSession(null);
    expect(redirect).toHaveBeenCalledWith(loginUrl);
  });

  it("should redirect to login if idToken is missing", () => {
    ensureValidSession({
      user: { sub: "test-user-id" },
      tokenSet: {
        accessToken: "test-access-token",
        expiresAt: Date.now() / 1000 + 3600,
      },
      internal: {
        sid: "test-session-id",
        createdAt: Date.now() / 1000,
      },
    });
    expect(redirect).toHaveBeenCalledWith(loginUrl);
  });

  it("should redirect to login if idToken is expired", () => {
    const expiredToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDk0NTkyMDB9.test"; // Expired
    ensureValidSession({
      user: { sub: "test-user-id" },
      tokenSet: {
        accessToken: "test-access-token",
        idToken: expiredToken,
        expiresAt: Date.now() / 1000 + 3600,
      },
      internal: {
        sid: "test-session-id",
        createdAt: Date.now() / 1000,
      },
    });
    expect(redirect).toHaveBeenCalledWith(loginUrl);
  });

  it("should not redirect if session and idToken are valid", () => {
    const validToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE5MjQ5OTIwMDB9.test"; // Not expired
    ensureValidSession({
      user: { sub: "test-user-id" },
      tokenSet: {
        accessToken: "test-access-token",
        idToken: validToken,
        expiresAt: Date.now() / 1000 + 3600,
      },
      internal: {
        sid: "test-session-id",
        createdAt: Date.now() / 1000,
      },
    });
    expect(redirect).not.toHaveBeenCalled();
  });
});
