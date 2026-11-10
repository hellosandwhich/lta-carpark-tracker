import { Carpark, VehicleCategory } from '../types/carpark';

/**
 * Calculates haversine distance between two coordinates in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Formats distance in km or m for Singapore road navigation
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Estimates driving time in minutes assuming typical Singapore urban speeds (~35 km/h)
 */
export function estimateDriveMinutes(distanceKm: number): number {
  const avgSpeedKmh = 35;
  const timeHours = distanceKm / avgSpeedKmh;
  const minutes = Math.round(timeHours * 60);
  return Math.max(2, minutes);
}

/**
 * Returns availability statistics for a given vehicle category
 */
export function getAvailabilityInfo(carpark: Carpark, vehicleType: VehicleCategory) {
  let total = 0;
  let available = 0;

  if (vehicleType === 'car') {
    total = carpark.lots.car.total;
    available = carpark.lots.car.available;
  } else if (vehicleType === 'motorcycle') {
    total = carpark.lots.motorcycle.total;
    available = carpark.lots.motorcycle.available;
  } else if (vehicleType === 'heavyVehicle') {
    total = carpark.lots.heavyVehicle?.total ?? 0;
    available = carpark.lots.heavyVehicle?.available ?? 0;
  } else if (vehicleType === 'ev') {
    total = carpark.evCharging?.total ?? 0;
    available = carpark.evCharging?.available ?? 0;
  }

  const percentageAvailable = total > 0 ? (available / total) * 100 : 0;
  const percentageOccupied = total > 0 ? Math.min(100, Math.round(((total - available) / total) * 100)) : 100;

  let status: 'Plenty' | 'Filling Fast' | 'Full' = 'Plenty';
  let badgeColor = 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
  let dotColor = 'bg-emerald-600 dark:bg-emerald-400';

  if (available <= 3 || percentageAvailable < 6) {
    status = 'Full';
    badgeColor = 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
    dotColor = 'bg-rose-600 dark:bg-rose-400';
  } else if (percentageAvailable < 20) {
    status = 'Filling Fast';
    badgeColor = 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
    dotColor = 'bg-amber-600 dark:bg-amber-400';
  }

  return {
    total,
    available,
    percentageAvailable,
    percentageOccupied,
    status,
    badgeColor,
    dotColor,
  };
}

/**
 * Calculates estimated parking fee given entry time, duration, and carpark rate rules
 */
export function estimateParkingFee(
  carpark: Carpark,
  durationMinutes: number,
  dayOfWeek: number, // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  entryHour: number // 0-23
): { fee: number; note: string; isFree: boolean } {
  // Check grace period
  if (durationMinutes <= carpark.rates.gracePeriodMinutes) {
    return {
      fee: 0,
      note: `Within ${carpark.rates.gracePeriodMinutes} mins grace period (Free)`,
      isFree: true,
    };
  }

  // Check Sunday Free Parking Scheme (FPS) for HDB
  if (dayOfWeek === 0 && carpark.rates.isFreeParkingSunday) {
    // 07:30 to 22:30 is free under HDB FPS
    if (entryHour >= 7 && entryHour < 22) {
      return {
        fee: 0,
        note: 'HDB Sunday Free Parking Scheme (07:30 - 22:30)',
        isFree: true,
      };
    }
  }

  const durationHours = durationMinutes / 60;

  // HDB standard parking calculation
  if (carpark.agency === 'HDB') {
    const ratePerHalfHour = carpark.rates.centralArea ? 1.20 : 0.60;
    const blocksOf30m = Math.ceil(durationMinutes / 30);
    const standardFee = blocksOf30m * ratePerHalfHour;

    // Check night cap
    const isNightTime = entryHour >= 22 || entryHour < 7;
    if (isNightTime && standardFee > 5.00) {
      return {
        fee: 5.00,
        note: 'Capped at HDB Night Parking Maximum of $5.00',
        isFree: false,
      };
    }

    return {
      fee: Number(standardFee.toFixed(2)),
      note: `${blocksOf30m} x 30m blocks @ $${ratePerHalfHour.toFixed(2)}`,
      isFree: false,
    };
  }

  // URA parking
  if (carpark.agency === 'URA') {
    const ratePerHalfHour = carpark.rates.centralArea ? 1.20 : 0.60;
    const blocksOf30m = Math.ceil(durationMinutes / 30);
    const fee = blocksOf30m * ratePerHalfHour;
    return {
      fee: Number(fee.toFixed(2)),
      note: `${blocksOf30m} x 30m blocks @ $${ratePerHalfHour.toFixed(2)} (URA)`,
      isFree: false,
    };
  }

  // Commercial Malls (ION, MBS, Suntec, etc.)
  const baseRate = carpark.rates.hourlyBaseRate;
  let estimatedTotal = baseRate;
  if (durationHours > 1) {
    const extraHours = durationHours - 1;
    estimatedTotal += extraHours * (baseRate * 0.7);
  }

  // Check night flat rates if entering in evening
  if (entryHour >= 18 && carpark.rates.weekdayNight.includes('flat')) {
    return {
      fee: 3.50,
      note: 'Evening / Night flat rate applied',
      isFree: false,
    };
  }

  return {
    fee: Number(estimatedTotal.toFixed(2)),
    note: `Based on standard commercial hourly rates`,
    isFree: false,
  };
}
