"use server";

import Track from "@/types/api";
import { fetchWithAuth } from "./api";

export async function getAllTracks(url: string): Promise<Track[]> {
  try {
    return await fetchWithAuth<Track[]>(url);
  } catch (error) {
    console.error("Failed to fetch tracks:", error);
    throw new Error("Failed to fetch tracks");
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
    console.error("Failed to create track:", error);
    throw new Error("Failed to create track");
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
    console.error("Failed to update track:", error);
    throw new Error("Failed to update track");
  }
}

export async function deleteTrack(url: string, id: string): Promise<void> {
  try {
    await fetchWithAuth<void>(`${url}/${id}`, { method: "DELETE" });
  } catch (error) {
    console.error("Failed to delete track:", error);
    throw new Error("Failed to delete track");
  }
}
