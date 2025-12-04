"use client";

import useSWR from "swr";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Stack from "@mui/material/Stack";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { useDropzone } from "react-dropzone";
import { getAllCars } from "@/lib/cars";
import { getAllTracks } from "@/lib/tracks";
import { useEditSessionForm } from "@/hooks/useEditSessionForm";
import { Session } from "@/types/api";

interface EditSessionModalProps {
  session: Session;
  onClose: () => void;
}

export default function EditSessionModal({
  session,
  onClose,
}: EditSessionModalProps) {
  const { data: cars } = useSWR(`/cars`, getAllCars);
  const { data: tracks } = useSWR(`/tracks`, getAllTracks);

  const { formik } = useEditSessionForm(session, onClose);

  const onDrop = (acceptedFiles: File[]) => {
    // Only allow one file
    if (acceptedFiles.length > 0) {
      formik.setFieldValue("uploadFiles", [acceptedFiles[0]]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  const handleRemoveFile = () => {
    formik.setFieldValue("uploadFiles", []);
  };

  const handleCancel = () => {
    formik.resetForm();
    onClose();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    formik.handleSubmit();
  };

  return (
    <Dialog open={true} onClose={handleCancel}>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>Edit Session</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ m: 2 }}>
            <TextField
              fullWidth
              label="Session ID"
              value={session.id}
              disabled
              InputProps={{
                readOnly: true,
              }}
            />
            <FormControl fullWidth>
              <InputLabel id="trackName-label">Track Name</InputLabel>
              <Select
                labelId="trackName-label"
                value={formik.values.trackId}
                label="Track Name"
                name="trackId"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.trackId && Boolean(formik.errors.trackId)}
              >
                {tracks?.map((track) => (
                  <MenuItem key={track.id!} value={track.id!}>
                    {track.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="car-label">Car</InputLabel>
              <Select
                labelId="car-label"
                value={formik.values.carId}
                label="Car"
                name="carId"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.carId && Boolean(formik.errors.carId)}
              >
                {cars?.map((car) => (
                  <MenuItem key={car.id!} value={car.id!}>
                    {car.year} {car.make} {car.model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Upload File (single file only)
              </Typography>
              <Box
                {...getRootProps()}
                sx={{
                  border: 2,
                  borderColor: isDragActive ? "primary.main" : "grey.300",
                  borderStyle: "dashed",
                  borderRadius: 1,
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  bgcolor: isDragActive ? "action.hover" : "background.paper",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "action.hover",
                  },
                }}
              >
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ fontSize: 48, color: "grey.400" }} />
                <Typography>
                  {isDragActive
                    ? "Drop the file here..."
                    : "Drag and drop a file here, or click to select a file"}
                </Typography>
              </Box>
              {formik.values.uploadFiles.length > 0 && (
                <List sx={{ mt: 2 }}>
                  {formik.values.uploadFiles.map((file, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={handleRemoveFile}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(2)} KB`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={formik.isSubmitting}>
            Cancel
          </Button>
          <Button
            type={"submit"}
            disabled={!formik.isValid || formik.isSubmitting}
            autoFocus
            startIcon={
              formik.isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : undefined
            }
          >
            {formik.isSubmitting ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
