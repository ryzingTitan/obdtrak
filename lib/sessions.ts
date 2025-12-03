"use server";

import { Session, SessionData } from "@/types/api";
import { fetchWithAuth } from "./api";
import { auth0 } from "@/lib/auth0";
import { ApiError } from "./api-error";

export async function getAllSessions(url: string): Promise<Session[]> {
  try {
    return await fetchWithAuth<Session[]>(url);
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error("Failed to fetch sessions");
  }
}

export async function createSessions(
  url: string,
  sessionData: SessionData,
): Promise<void> {
  const session = await auth0.getSession();

  const formData = new FormData();
  formData.append("carId", sessionData.carId);
  formData.append("trackId", sessionData.trackId);
  formData.append("userEmail", session?.user.email ?? "");
  formData.append("userFirstName", session?.user?.name?.split(" ")[0] ?? "");
  formData.append("userLastName", session?.user?.name?.split(" ")[1] ?? "");

  if (sessionData.uploadFiles && sessionData.uploadFiles.length > 0) {
    sessionData.uploadFiles.forEach((file) => {
      formData.append("uploadFiles", file);
    });
  }

  try {
    return await fetchWithAuth<void>(url, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    console.error("Failed to create sessions:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error("Failed to create sessions");
  }
}

export async function updateSession(
  url: string,
  sessionData: SessionData,
): Promise<void> {
  const session = await auth0.getSession();

  const formData = new FormData();
  formData.append("carId", sessionData.carId);
  formData.append("trackId", sessionData.trackId);
  formData.append("userEmail", session?.user.email ?? "");
  formData.append("userFirstName", session?.user?.name?.split(" ")[0] ?? "");
  formData.append("userLastName", session?.user?.name?.split(" ")[1] ?? "");

  if (sessionData.uploadFiles && sessionData.uploadFiles.length > 0) {
    sessionData.uploadFiles.forEach((file) => {
      formData.append("uploadFile", file);
    });
  }

  try {
    return await fetchWithAuth<void>(url, {
      method: "PUT",
      body: formData,
    });
  } catch (error) {
    console.error("Failed to update session:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error("Failed to update session");
  }
}
