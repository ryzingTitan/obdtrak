"use client";

import { useFormik } from "formik";
import { useSWRConfig } from "swr";
import { useSnackbar } from "notistack";
import { SessionData } from "@/types/api";
import { createSessions } from "@/lib/sessions";
import { sessionValidationSchema } from "@/types/validations";

export const useAddSessionForm = (onSuccess?: () => void) => {
  const { mutate } = useSWRConfig();
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
        await createSessions(`/sessions`, newSession);
        await mutate(`/sessions`);
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
