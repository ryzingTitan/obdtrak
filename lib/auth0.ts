import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { redirect } from "next/navigation";
import { SessionData } from "@auth0/nextjs-auth0/types";

export const auth0 = new Auth0Client();

export const loginUrl = "/auth/login";
export const logoutUrl = "/auth/logout";

export function isIdTokenExpired(
  idToken?: string,
  clockSkewSeconds = 30,
): boolean {
  if (!idToken) return true;
  try {
    const parts = idToken.split(".");
    if (parts.length < 2) return true;
    const payloadB64Url = parts[1];
    // Convert base64url to base64
    const b64 = payloadB64Url.replace(/-/g, "+").replace(/_/g, "/");
    // Pad base64 string
    const padded = b64 + "===".slice((b64.length + 3) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    const payload = JSON.parse(json) as { exp?: number };
    if (!payload.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    // Consider token expired if now is within skew window of exp or beyond
    return now >= payload.exp - clockSkewSeconds;
  } catch {
    return true;
  }
}

export function ensureValidSession(session: SessionData | null): void {
  if (!session) {
    redirect(loginUrl);
  }
  const idToken: string | undefined = session?.tokenSet?.idToken;
  if (!idToken || isIdTokenExpired(idToken)) {
    redirect(loginUrl);
  }
}
