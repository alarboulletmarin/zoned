/**
 * Unit conversion utilities for metric/imperial support
 */

import type { UnitSystem } from "@/types/settings";

const KM_TO_MILES = 0.621371;
const METERS_TO_YARDS = 1.09361;

/**
 * Convert distance in km to the target unit system
 */
export function convertDistance(km: number, unit: UnitSystem): number {
  if (unit === "imperial") {
    return km * KM_TO_MILES;
  }
  return km;
}

/**
 * Convert distance in meters to the target unit system (yards for imperial)
 */
export function convertMeters(meters: number, unit: UnitSystem): number {
  if (unit === "imperial") {
    return meters * METERS_TO_YARDS;
  }
  return meters;
}

/**
 * Convert pace (min/km) to target unit system (min/mile for imperial)
 */
export function convertPace(minPerKm: number, unit: UnitSystem): number {
  if (unit === "imperial") {
    // min/km * (km/mile) = min/mile
    return minPerKm / KM_TO_MILES;
  }
  return minPerKm;
}

/**
 * Convert speed (km/h) to target unit system (mph for imperial)
 */
export function convertSpeed(kmh: number, unit: UnitSystem): number {
  if (unit === "imperial") {
    return kmh * KM_TO_MILES;
  }
  return kmh;
}

/**
 * Format pace with unit suffix
 * @param minPerKm - Pace in minutes per kilometer
 * @param unit - Target unit system
 * @returns Formatted string like "4:30/km" or "7:14/mi"
 */
export function formatPaceWithUnit(minPerKm: number, unit: UnitSystem): string {
  const pace = convertPace(minPerKm, unit);
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  const suffix = unit === "imperial" ? "/mi" : "/km";
  return `${minutes}:${seconds.toString().padStart(2, "0")}${suffix}`;
}

/**
 * Format speed with unit suffix
 * @param kmh - Speed in km/h
 * @param unit - Target unit system
 * @returns Formatted string like "12.5 km/h" or "7.8 mph"
 */
export function formatSpeedWithUnit(kmh: number, unit: UnitSystem): string {
  const speed = convertSpeed(kmh, unit);
  const suffix = unit === "imperial" ? "mph" : "km/h";
  return `${speed.toFixed(1)} ${suffix}`;
}

/**
 * Get pace unit label
 */
export function getPaceUnit(unit: UnitSystem): string {
  return unit === "imperial" ? "/mi" : "/km";
}

/**
 * Get speed unit label
 */
export function getSpeedUnit(unit: UnitSystem): string {
  return unit === "imperial" ? "mph" : "km/h";
}

/**
 * Get distance unit label
 */
export function getDistanceUnit(unit: UnitSystem): string {
  return unit === "imperial" ? "mi" : "km";
}

/**
 * Convert distance text like "400m", "5k", "21km" to imperial equivalents
 * @param text - Distance string
 * @param unit - Target unit system
 * @returns Converted string like "440yd", "3.1mi", "13.1mi"
 */
export function convertDistanceText(text: string, unit: UnitSystem): string {
  if (unit === "metric") return text;

  // Match patterns like "400m", "200m", "1000m"
  const metersMatch = text.match(/^(\d+)m$/i);
  if (metersMatch) {
    const meters = parseInt(metersMatch[1], 10);
    const yards = Math.round(meters * METERS_TO_YARDS);
    return `${yards}yd`;
  }

  // Match patterns like "5k", "10k", "21k"
  const kMatch = text.match(/^(\d+(?:\.\d+)?)k$/i);
  if (kMatch) {
    const km = parseFloat(kMatch[1]);
    const miles = km * KM_TO_MILES;
    return `${miles.toFixed(1)}mi`;
  }

  // Match patterns like "5km", "10km", "21.1km"
  const kmMatch = text.match(/^(\d+(?:\.\d+)?)km$/i);
  if (kmMatch) {
    const km = parseFloat(kmMatch[1]);
    const miles = km * KM_TO_MILES;
    return `${miles.toFixed(1)}mi`;
  }

  // No conversion needed
  return text;
}

/**
 * Format distance with appropriate unit
 * @param km - Distance in kilometers
 * @param unit - Target unit system
 * @returns Formatted string like "5 km" or "3.1 mi"
 */
export function formatDistanceWithUnit(km: number, unit: UnitSystem): string {
  const distance = convertDistance(km, unit);
  const suffix = unit === "imperial" ? "mi" : "km";
  return `${distance.toFixed(1)} ${suffix}`;
}
