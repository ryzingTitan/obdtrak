"use client";

import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Tooltip from "@mui/material/Tooltip";
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
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { getAllCars } from "@/lib/cars";
import { getAllTracks } from "@/lib/tracks";
import { useAddSessionForm } from "@/hooks/useAddSessionForm";

export default function AddSessionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: cars } = useSWR(`/cars`, getAllCars);
  const { data: tracks } = useSWR(`/tracks`, getAllTracks);

  const handleClose = () => {
    setIsOpen(false);
  };

  const { formik } = useAddSessionForm(handleClose);

  const onDrop = (acceptedFiles: File[]) => {
    formik.setFieldValue("uploadFiles", [
      ...formik.values.uploadFiles,
      ...acceptedFiles,
    ]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const handleRemoveFile = (index: number) => {
    const newFiles = formik.values.uploadFiles.filter((_, i) => i !== index);
    formik.setFieldValue("uploadFiles", newFiles);
  };

  const handleOpen = () => setIsOpen(true);

  const handleCancel = () => {
    formik.resetForm();
    handleClose();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    formik.handleSubmit();
  };

  return (
    <>
      <Tooltip title={"Add Session"}>
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 72, right: 16, zIndex: 1101 }}
          onClick={handleOpen}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
      <Dialog open={isOpen} onClose={handleCancel}>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>Add Session</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ m: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="trackName-label">Track Name</InputLabel>
                <Select
                  labelId="trackName-label"
                  value={formik.values.trackId}
                  label="Track Name"
                  name="trackId"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.trackId && Boolean(formik.errors.trackId)
                  }
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
                  Upload Files
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
                      ? "Drop the files here..."
                      : "Drag and drop files here, or click to select files"}
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
                            onClick={() => handleRemoveFile(index)}
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
              {formik.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
