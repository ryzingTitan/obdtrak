import * as yup from "yup";

export const sessionValidationSchema = yup.object({
  carId: yup.string().required("Car is required"),
  trackId: yup.string().required("Track is required"),
});
