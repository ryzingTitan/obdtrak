"use server";

import { Record } from "@/types/api";
import { fetchWithAuth } from "./api";

export async function getRecordsBySessionId(url: string): Promise<Record[]> {
  try {
    return await fetchWithAuth<Record[]>(url);
  } catch (error) {
    console.error("Failed to fetch records:", error);
    throw new Error("Failed to fetch records");
  }
}
