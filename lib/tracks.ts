"use server";

import Track from "@/types/api";
import { fetchWithAuth } from "./api";

const handleTrackError = (error: unknown, message: string) => {
  console.error(`${message}:`, error);
  return Promise.reject(message);
};

export async function getAllTracks(url: string): Promise<Track[]> {
  try {
    return await fetchWithAuth<Track[]>(url);
  } catch (error) {
    return handleTrackError(error, "Failed to fetch tracks");
  }
}

export async function createTrack(
  url: string,
  track: Partial<Track>,
): Promise<Track> {
  try {
    return await fetchWithAuth<Track>(url, {
      method: "POST",
      body: track,
    });
  } catch (error) {
    return handleTrackError(error, "Failed to create track");
  }
}

export async function updateTrack(
  url: string,
  id: string,
  patch: Partial<Track>,
): Promise<Track> {
  try {
    return await fetchWithAuth<Track>(`${url}/${id}`, {
      method: "PUT",
      body: patch,
    });
  } catch (error) {
    return handleTrackError(error, "Failed to update track");
  }
}

export async function deleteTrack(url: string, id: string): Promise<void> {
  try {
    await fetchWithAuth<void>(`${url}/${id}`, { method: "DELETE" });
  } catch (error) {
    return handleTrackError(error, "Failed to delete track");
  }
}
