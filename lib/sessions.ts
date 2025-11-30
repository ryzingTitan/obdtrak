"use server";

import { Session } from "@/types/api";
import { fetchWithAuth } from "./api";

export async function getAllSessions(url: string): Promise<Session[]> {
  try {
    return await fetchWithAuth<Session[]>(url);
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    throw new Error("Failed to fetch sessions");
  }
}
