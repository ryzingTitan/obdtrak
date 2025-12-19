// Temperature ranges for color coding
export const getTempColor = (temp: number, max: number = 220): string => {
  if (temp < max * 0.7) return "#4caf50"; // Green - safe
  if (temp < max * 0.85) return "#ff9800"; // Orange - warm
  return "#f44336"; // Red - hot
};

// RPM gauge color
export const getRpmColor = (rpm: number, redline: number = 6000): string => {
  if (rpm >= redline) return "#f44336"; // Red - at or above redline
  if (rpm >= redline * 0.85) return "#ff9800"; // Orange - 85% to redline
  return "#4caf50"; // Green - below 85%
};
