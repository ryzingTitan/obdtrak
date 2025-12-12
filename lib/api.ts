"use server";

import { auth0 } from "@/lib/auth0";
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
  const accessToken = await auth0.getAccessToken();

  const baseUrl = process.env.API_BASE_URL;
  const fullUrl = new URL(baseUrl + url);

  if (options.params) {
    fullUrl.search = new URLSearchParams(options.params).toString();
  }

  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken.token}`,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(fullUrl, {
    method: options.method || "GET",
    headers,
    body: options.body
      ? isFormData
        ? (options.body as FormData)
        : JSON.stringify(options.body)
      : undefined,
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

  const contentType = response.headers.get("content-type");
  const contentLength = response.headers.get("content-length");

  if (
    contentLength === "0" ||
    !contentType ||
    !contentType.includes("application/json")
  ) {
    return Promise.resolve(undefined as T);
  }

  return response.json();
}
