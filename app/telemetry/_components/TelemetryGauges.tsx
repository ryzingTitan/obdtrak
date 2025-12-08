import { Box } from "@mui/material";
import SpeedIcon from "@mui/icons-material/Speed";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import { Gauge } from "./Gauge";
import { RpmGauge } from "./RpmGauge";

// Constants for gauge limits and thresholds
const GAUGE_LIMITS = {
  COOLANT_TEMP_MIN: 100,
  COOLANT_TEMP_MAX: 220,
  INTAKE_TEMP_MIN: 40,
  INTAKE_TEMP_MAX: 120,
  SPEED_MIN: 0,
  SPEED_MAX: 150,
  THROTTLE_MIN: 0,
  THROTTLE_MAX: 100,
  BOOST_MIN: 0,
  BOOST_MAX: 20,
  MANIFOLD_MIN: 0,
  MANIFOLD_MAX: 30,
  OIL_PRESSURE_MIN: 0,
  OIL_PRESSURE_MAX: 80,
  OIL_PRESSURE_WARNING_THRESHOLD: 20,
} as const;

const ENGINE_REDLINE = 7000;

interface TelemetryData {
  coolantTemperature: number;
  intakeAirTemperature: number;
  engineRpm: number;
  speed: number;
  throttlePosition: number;
  boostPressure: number;
  manifoldPressure: number;
  oilPressure: number;
}

interface TelemetryGaugesProps {
  telemetry: TelemetryData;
  coolantColor: string;
  intakeColor: string;
  hasBoostData: boolean;
  hasOilPressureData: boolean;
  hasManifoldPressureData: boolean;
}

export function TelemetryGauges({
  telemetry,
  coolantColor,
  intakeColor,
  hasBoostData,
  hasOilPressureData,
  hasManifoldPressureData,
}: TelemetryGaugesProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(2, 1fr)",
        },
        gap: 2,
      }}
    >
      {/* RPM - Prominent circular gauge - spans 2 columns on desktop */}
      <Box sx={{ gridColumn: { xs: "span 2", sm: "span 1", md: "span 2" } }}>
        <RpmGauge rpm={telemetry.engineRpm} redline={ENGINE_REDLINE} />
      </Box>

      {/* Speed - Large display - spans 2 columns on desktop */}
      <Box sx={{ gridColumn: { xs: "span 2", sm: "span 1", md: "span 2" } }}>
        <Gauge
          label="Vehicle Speed"
          value={telemetry.speed}
          unit="MPH"
          min={GAUGE_LIMITS.SPEED_MIN}
          max={GAUGE_LIMITS.SPEED_MAX}
          showBar={true}
          color="#1976d2"
          icon={<SpeedIcon />}
        />
      </Box>

      {/* Coolant Temperature */}
      <Box>
        <Gauge
          label="Coolant Temp"
          value={telemetry.coolantTemperature}
          unit="°F"
          min={GAUGE_LIMITS.COOLANT_TEMP_MIN}
          max={GAUGE_LIMITS.COOLANT_TEMP_MAX}
          showBar={true}
          color={coolantColor}
          icon={<ThermostatIcon />}
        />
      </Box>

      {/* Intake Air Temperature */}
      <Box>
        <Gauge
          label="Intake Temp"
          value={telemetry.intakeAirTemperature}
          unit="°F"
          min={GAUGE_LIMITS.INTAKE_TEMP_MIN}
          max={GAUGE_LIMITS.INTAKE_TEMP_MAX}
          showBar={true}
          color={intakeColor}
          icon={<ThermostatIcon />}
        />
      </Box>

      {/* Throttle Position */}
      <Box>
        <Gauge
          label="Throttle"
          value={telemetry.throttlePosition}
          unit="%"
          min={GAUGE_LIMITS.THROTTLE_MIN}
          max={GAUGE_LIMITS.THROTTLE_MAX}
          showBar={true}
          color="#ff9800"
          icon={<LocalGasStationIcon />}
        />
      </Box>

      {/* Boost Pressure - only show if any record has boost > 0 */}
      {hasBoostData && (
        <Box>
          <Gauge
            label="Boost"
            value={telemetry.boostPressure}
            unit="PSI"
            min={GAUGE_LIMITS.BOOST_MIN}
            max={GAUGE_LIMITS.BOOST_MAX}
            showBar={true}
            color="#9c27b0"
          />
        </Box>
      )}

      {/* Manifold Pressure - only show if any record has manifold pressure > 0 */}
      {hasManifoldPressureData && (
        <Box>
          <Gauge
            label="Manifold"
            value={telemetry.manifoldPressure}
            unit="inHg"
            min={GAUGE_LIMITS.MANIFOLD_MIN}
            max={GAUGE_LIMITS.MANIFOLD_MAX}
            showBar={false}
            color="#00bcd4"
          />
        </Box>
      )}

      {/* Oil Pressure - only show if any record has oil pressure > 0 */}
      {hasOilPressureData && (
        <Box>
          <Gauge
            label="Oil Pressure"
            value={telemetry.oilPressure}
            unit="PSI"
            min={GAUGE_LIMITS.OIL_PRESSURE_MIN}
            max={GAUGE_LIMITS.OIL_PRESSURE_MAX}
            showBar={true}
            color={
              telemetry.oilPressure >
              GAUGE_LIMITS.OIL_PRESSURE_WARNING_THRESHOLD
                ? "#4caf50"
                : "#f44336"
            }
          />
        </Box>
      )}
    </Box>
  );
}

export { GAUGE_LIMITS, ENGINE_REDLINE };
export type { TelemetryData };
