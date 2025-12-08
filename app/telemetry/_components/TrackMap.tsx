"use client";

import { useEffect, useRef } from "react";
import { Box, Paper, Typography, Chip } from "@mui/material";
import SpeedIcon from "@mui/icons-material/Speed";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Track map component
interface TrackMapProps {
  latitude: number;
  longitude: number;
}

// Component to update map center when position changes
function MapUpdater({ latitude, longitude }: TrackMapProps) {
  const map = useMap();
  const prevPositionRef = useRef({ latitude, longitude });

  useEffect(() => {
    // Only update if position has actually changed
    if (
      prevPositionRef.current.latitude !== latitude ||
      prevPositionRef.current.longitude !== longitude
    ) {
      map.setView([latitude, longitude], map.getZoom());
      prevPositionRef.current = { latitude, longitude };
    }
  }, [latitude, longitude, map]);

  return null;
}

export function TrackMap({ latitude, longitude }: TrackMapProps) {
  // Configure default Leaflet icon
  useEffect(() => {
    const icon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = icon;
  }, []);

  // Validate coordinates
  const hasValidCoordinates = latitude !== 0 && longitude !== 0;

  return (
    <Paper
      elevation={3}
      sx={{
        height: "100%",
        minHeight: { xs: 300, md: 500 },
        background: "linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          position: "relative",
          zIndex: 1000,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            textTransform: "uppercase",
            letterSpacing: 1.5,
            fontWeight: 600,
          }}
        >
          Track Position
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
        </Typography>
      </Box>

      {/* Map */}
      <Box
        sx={{
          height: "calc(100% - 80px)",
          position: "relative",
        }}
      >
        {hasValidCoordinates ? (
          <>
            <MapContainer
              center={[latitude, longitude]}
              zoom={17}
              style={{ height: "100%", width: "100%" }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[latitude, longitude]}>
                <Popup>Current Vehicle Position</Popup>
              </Marker>
              <MapUpdater latitude={latitude} longitude={longitude} />
            </MapContainer>

            {/* Position indicator label */}
            <Chip
              icon={<SpeedIcon />}
              label="CURRENT POSITION"
              sx={{
                position: "absolute",
                top: 20,
                right: 20,
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                color: "#4caf50",
                fontWeight: 600,
                borderColor: "#4caf50",
                border: "1px solid",
                zIndex: 1000,
              }}
            />
          </>
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#121212",
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No GPS coordinates available
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
