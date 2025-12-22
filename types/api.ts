export default interface Track {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface Car {
  id: string;
  year: number;
  make: string;
  model: string;
}

export interface Session {
  id: string;
  startTime: string;
  endTime: string;
  trackName: string;
  trackLatitude: number;
  trackLongitude: number;
  carYear: number;
  carMake: string;
  carModel: string;
  videoUrl?: string;
}

export interface SessionData {
  carId: string;
  trackId: string;
  uploadFiles?: File[];
}

export interface Record {
  id?: string;
  sessionId: string;
  timestamp: string;
  longitude: number;
  latitude: number;
  altitude: number;
  intakeAirTemperature: number | null | undefined;
  boostPressure: number | null | undefined;
  coolantTemperature: number | null | undefined;
  engineRpm: number | null | undefined;
  speed: number | null | undefined;
  throttlePosition: number | null | undefined;
  airFuelRatio: number | null | undefined;
  oilPressure: number | null | undefined;
  manifoldPressure: number | null | undefined;
  massAirFlow: number | null | undefined;
}
