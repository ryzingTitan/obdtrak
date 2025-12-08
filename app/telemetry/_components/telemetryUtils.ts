// Temperature ranges for color coding
export const getTempColor = (temp: number, max: number = 220): string => {
  if (temp < max * 0.7) return "#4caf50"; // Green - safe
  if (temp < max * 0.85) return "#ff9800"; // Orange - warm
  return "#f44336"; // Red - hot
};

// RPM gauge color
export const getRpmColor = (rpm: number, redline: number = 7000): string => {
  if (rpm < redline * 0.7) return "#4caf50";
  if (rpm < redline * 0.9) return "#ff9800";
  return "#f44336";
};
