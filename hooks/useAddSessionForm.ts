"use client";

import { useFormik } from "formik";
import useSWR from "swr";
import { useSnackbar } from "notistack";
import { SessionData, Session } from "@/types/api";
import { createSessions, getAllSessions } from "@/lib/sessions";
import { sessionValidationSchema } from "@/types/validations";
import { useUser } from "@auth0/nextjs-auth0";

export const useAddSessionForm = (onSuccess?: () => void) => {
  const { user } = useUser();
  const swrKey = `/sessions?userEmail=${user?.email}`;
  const { mutate } = useSWR<Session[]>(swrKey, getAllSessions);
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      carId: "",
      trackId: "",
      uploadFiles: [] as File[],
    },
    validationSchema: sessionValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const newSession: SessionData = {
          carId: values.carId,
          trackId: values.trackId,
          uploadFiles: values.uploadFiles,
        };
        await createSessions("/sessions", newSession);
        await mutate();
        enqueueSnackbar("Session created", { variant: "success" });
        resetForm();
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Failed to create session:", error);
        enqueueSnackbar("Failed to create session", { variant: "error" });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return { formik };
};
