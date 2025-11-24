"use server";

import { auth0, ensureValidSession } from "@/lib/auth0";
import { ApiError } from "./api-error";

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  params?: Record<string, string>;
};

export async function fetchWithAuth<T>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  const session = await auth0.getSession();
  ensureValidSession(session);

  const baseUrl = process.env.API_BASE_URL;
  const fullUrl = new URL(baseUrl + url);

  if (options.params) {
    fullUrl.search = new URLSearchParams(options.params).toString();
  }

  const response = await fetch(fullUrl, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.tokenSet.idToken}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
      response.statusText,
    );
  }

  if (response.status === 204) {
    return Promise.resolve(undefined as T);
  }

  return response.json();
}
