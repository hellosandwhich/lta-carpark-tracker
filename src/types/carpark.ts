export type AgencyType = 'HDB' | 'URA' | 'LTA' | 'Commercial';

export type CarparkType = 'Multi-Storey (MSCP)' | 'Surface / Open Air' | 'Basement' | 'Mechanised';

export type RegionType = 'Central' | 'East' | 'West' | 'North' | 'North-East';

export type VehicleCategory = 'car' | 'motorcycle' | 'heavyVehicle' | 'ev';

export interface LotBreakdown {
  total: number;
  available: number;
}

export interface EVChargerInfo {
  total: number;
  available: number;
  operator: 'SP Mobility' | 'CDG ENGIE' | 'Shell Recharge' | 'Tesla Supercharger' | 'Charge+';
  powerKw: number; // e.g. 50kW DC, 22kW AC
  connectorType: 'Type 2' | 'CCS2';
}

export interface ParkingRates {
  weekdayDay: string; // e.g. "$0.60 per 30 mins" or "$3.00 for 1st hr, $1.50 per 30m"
  weekdayNight: string; // e.g. "$5.00 max cap (22:30 - 07:00)"
  saturday: string;
  sundayPublicHoliday: string;
  gracePeriodMinutes: number; // 10 or 15 mins
  isFreeParkingSunday: boolean; // HDB Free Parking Scheme (FPS) on Sundays/PH 07:30 - 22:30
  centralArea: boolean; // Central Area HDB rate ($1.20/30m) vs Normal ($0.60/30m)
  hourlyBaseRate: number; // approximate per hour in SGD for quick sorting/calculation
}

export interface ERPGantryInfo {
  name: string;
  distanceMetres: number;
  activeRate: string; // e.g. "$2.00 (18:00 - 19:30)" or "No Charge Currently"
}

export interface Carpark {
  id: string; // Unique ID (e.g. HD-TP1, CM-ION)
  carparkNumber: string; // Official LTA/HDB code (e.g. TP1, ACB, ION-CP)
  name: string; // Display Name (e.g. "Toa Payoh Central Hub MSCP", "ION Orchard Carpark")
  address: string; // Full SG address
  postalCode: string; // 6-digit SG postal code
  region: RegionType;
  coordinates: {
    lat: number;
    lng: number;
  };
  agency: AgencyType;
  carparkType: CarparkType;
  electronicParking: boolean; // EPS gantry system
  heightLimitMetres: number; // e.g. 2.15
  lots: {
    car: LotBreakdown;
    motorcycle: LotBreakdown;
    heavyVehicle?: LotBreakdown;
  };
  evCharging?: EVChargerInfo;
  accessibleLots: LotBreakdown;
  rates: ParkingRates;
  nearbyErp?: ERPGantryInfo;
  lastUpdated: string; // ISO string
}

export interface FilterState {
  searchQuery: string;
  agency: 'all' | AgencyType;
  region: 'all' | RegionType;
  vehicleType: VehicleCategory;
  onlyAvailable: boolean;
  minAvailableLots: number;
  hasEvChargers: boolean;
  hasFreeSunday: boolean;
  minHeightLimit: number; // 0 for any, 2.0, 2.1
  sortBy: 'lots-desc' | 'lots-asc' | 'distance' | 'price' | 'name';
}

export interface UserLocation {
  name: string;
  lat: number;
  lng: number;
  isCustomGps?: boolean;
}
