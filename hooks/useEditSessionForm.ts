"use client";

import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import { SessionData, Session } from "@/types/api";
import { updateSession, getAllSessions } from "@/lib/sessions";
import { sessionValidationSchema } from "@/types/validations";
import useSWR from "swr";
import { getAllCars } from "@/lib/cars";
import { getAllTracks } from "@/lib/tracks";
import { useUser } from "@auth0/nextjs-auth0";

export const useEditSessionForm = (
  session: Session,
  onSuccess?: () => void,
) => {
  const { user } = useUser();
  const swrKey = `/sessions?userEmail=${user?.email}`;
  const { mutate } = useSWR<Session[]>(swrKey, getAllSessions);
  const { enqueueSnackbar } = useSnackbar();
  const { data: cars } = useSWR(`/cars`, getAllCars);
  const { data: tracks } = useSWR(`/tracks`, getAllTracks);

  // Find the trackId based on trackName
  const trackId =
    tracks?.find((track) => track.name === session.trackName)?.id || "";

  // Find the carId based on car details
  const carId =
    cars?.find(
      (car) =>
        car.year === session.carYear &&
        car.make === session.carMake &&
        car.model === session.carModel,
    )?.id || "";

  const formik = useFormik({
    initialValues: {
      carId: carId,
      trackId: trackId,
      uploadFiles: [] as File[],
    },
    enableReinitialize: true,
    validationSchema: sessionValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const sessionData: SessionData = {
          carId: values.carId,
          trackId: values.trackId,
          uploadFiles: values.uploadFiles,
        };
        await updateSession(`/sessions/${session.id}`, sessionData);
        await mutate();
        enqueueSnackbar("Session updated", { variant: "success" });
        resetForm();
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Failed to update session:", error);
        enqueueSnackbar("Failed to update session", { variant: "error" });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return { formik };
};
