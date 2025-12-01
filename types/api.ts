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
}

export interface SessionData {
  carId: string;
  trackId: string;
  uploadFiles?: File[];
}
