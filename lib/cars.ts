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

export async function createCar(url: string, car: Partial<Car>): Promise<Car> {
  try {
    return await fetchWithAuth<Car>(url, {
      method: "POST",
      body: car,
    });
  } catch (error) {
    console.error("Failed to create car:", error);
    throw new Error("Failed to create car");
  }
}

export async function updateCar(
  url: string,
  id: string,
  patch: Partial<Car>,
): Promise<Car> {
  try {
    return await fetchWithAuth<Car>(`${url}/${id}`, {
      method: "PUT",
      body: patch,
    });
  } catch (error) {
    console.error("Failed to update car:", error);
    throw new Error("Failed to update car");
  }
}

export async function deleteCar(url: string, id: string): Promise<void> {
  try {
    await fetchWithAuth<void>(`${url}/${id}`, { method: "DELETE" });
  } catch (error) {
    console.error("Failed to delete car:", error);
    throw new Error("Failed to delete car");
  }
}
