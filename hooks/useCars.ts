import useSWR from "swr";
import { Car } from "@/types/api";
import { getAllCars } from "@/lib/cars";

export const useCars = () => {
  const swrKey = `/cars`;
  const { data, isLoading } = useSWR<Car[]>(swrKey, getAllCars);

  return {
    cars: data || [],
    isLoading,
  };
};
