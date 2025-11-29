"use server";

import { Car } from "@/types/api";
import { fetchWithAuth } from "./api";

export async function getAllCars(url: string): Promise<Car[]> {
  try {
    return await fetchWithAuth<Car[]>(url);
  } catch (error) {
    console.error("Failed to fetch cars:", error);
    throw new Error("Failed to fetch cars");
  }
}
