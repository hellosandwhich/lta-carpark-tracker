import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Carpark, FilterState, UserLocation, VehicleCategory } from '../types/carpark';
import { INITIAL_CARPARKS, SINGAPORE_LOCATIONS } from '../data/singaporeCarparks';
import { calculateDistanceKm, getAvailabilityInfo } from '../utils/geoUtils';

interface CarparkContextType {
  carparks: Carpark[];
  lastSyncTime: Date;
  isLiveSyncing: boolean;
  syncIntervalSec: number;
  setSyncIntervalSec: (sec: number) => void;
  toggleLiveSync: () => void;
  refreshNow: () => void;
  userLocation: UserLocation;
  setUserLocation: (loc: UserLocation) => void;
  requestGpsLocation: () => Promise<void>;
  isGpsLoading: boolean;
  gpsError: string | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  selectedCarpark: Carpark | null;
  setSelectedCarpark: (cp: Carpark | null) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  viewMode: 'split' | 'map' | 'list';
  setViewMode: (mode: 'split' | 'map' | 'list') => void;
  isFeeCalcOpen: boolean;
  setIsFeeCalcOpen: (open: boolean) => void;
  feeCalcTarget: Carpark | null;
  openFeeCalc: (cp: Carpark) => void;
  isBackendDocsOpen: boolean;
  setIsBackendDocsOpen: (open: boolean) => void;
  isLtaConnected: boolean;
  ltaStatusMessage: string;
  isLtaLoading: boolean;
  filteredCarparks: (Carpark & { distanceKm: number })[];
  kpiStats: {
    totalLots: number;
    availableLots: number;
    evAvailable: number;
    freeSundayCount: number;
    avgOccupancy: number;
  };
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  agency: 'all',
  region: 'all',
  vehicleType: 'car',
  onlyAvailable: false,
  minAvailableLots: 0,
  hasEvChargers: false,
  hasFreeSunday: false,
  minHeightLimit: 0,
  sortBy: 'distance',
};

const CarparkContext = createContext<CarparkContextType | undefined>(undefined);

export const CarparkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [carparks, setCarparks] = useState<Carpark[]>(() => {
    // Try restoring state or use initial data
    return INITIAL_CARPARKS;
  });
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(true);
  const [syncIntervalSec, setSyncIntervalSec] = useState<number>(20);
  const [userLocation, setUserLocation] = useState<UserLocation>(SINGAPORE_LOCATIONS[0]);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');

  const [isFeeCalcOpen, setIsFeeCalcOpen] = useState<boolean>(false);
  const [feeCalcTarget, setFeeCalcTarget] = useState<Carpark | null>(null);
  const [isBackendDocsOpen, setIsBackendDocsOpen] = useState<boolean>(false);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('parksg_favorites');
      return saved ? JSON.parse(saved) : ['CM-ION', 'HD-TP1'];
    } catch {
      return ['CM-ION', 'HD-TP1'];
    }
  });

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      try {
        localStorage.setItem('parksg_favorites', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const openFeeCalc = useCallback((cp: Carpark) => {
    setFeeCalcTarget(cp);
    setIsFeeCalcOpen(true);
  }, []);

  const [isLtaConnected, setIsLtaConnected] = useState<boolean>(false);
  const [ltaStatusMessage, setLtaStatusMessage] = useState<string>('Simulation Active (Awaiting LTA Key)');
  const [isLtaLoading, setIsLtaLoading] = useState<boolean>(false);

  // Real-time lot sync (queries /api/carparkavailability and falls back to simulation)
  const refreshNow = useCallback(async () => {
    setIsLtaLoading(true);
    try {
      const response = await fetch('/api/carparkavailability');
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.value) && data.value.length > 0) {
          setIsLtaConnected(true);
          setLtaStatusMessage(`Connected to LTA DataMall v2 (${data.count} lots streamed)`);
          
          // Map LTA lots to our carparks
          const ltaMap = new Map<string, number>();
          data.value.forEach((item: any) => {
            if (item.CarParkID) {
              ltaMap.set(String(item.CarParkID).toUpperCase(), Number(item.AvailableLots) || 0);
            }
          });

          setCarparks(prev =>
            prev.map(cp => {
              const matchedLots = ltaMap.get(cp.carparkNumber.toUpperCase());
              if (matchedLots !== undefined) {
                return {
                  ...cp,
                  lots: {
                    ...cp.lots,
                    car: { ...cp.lots.car, available: matchedLots },
                  },
                  lastUpdated: new Date().toISOString(),
                };
              }
              return cp;
            })
          );
          setLastSyncTime(new Date());
          setIsLtaLoading(false);
          return;
        } else if (data.error) {
          setIsLtaConnected(false);
          setLtaStatusMessage(data.error);
        }
      }
    } catch {
      // Backend not running or offline; proceed with realistic client simulation
      setIsLtaConnected(false);
    }
    setIsLtaLoading(false);

    // Realistic simulation flux
    setCarparks(prev => {
      return prev.map(cp => {
        const carDelta = Math.floor(Math.random() * 5) - 2;
        const newCarAvail = Math.max(0, Math.min(cp.lots.car.total, cp.lots.car.available + carDelta));

        const motoDelta = Math.floor(Math.random() * 3) - 1;
        const newMotoAvail = Math.max(0, Math.min(cp.lots.motorcycle.total, cp.lots.motorcycle.available + motoDelta));

        let newEv = cp.evCharging;
        if (cp.evCharging) {
          const evDelta = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          const newAvail = Math.max(0, Math.min(cp.evCharging.total, cp.evCharging.available + evDelta));
          newEv = { ...cp.evCharging, available: newAvail };
        }

        return {
          ...cp,
          lots: {
            ...cp.lots,
            car: { ...cp.lots.car, available: newCarAvail },
            motorcycle: { ...cp.lots.motorcycle, available: newMotoAvail },
          },
          evCharging: newEv,
          lastUpdated: new Date().toISOString(),
        };
      });
    });
    setLastSyncTime(new Date());
  }, []);

  // Interval timer for live updates
  useEffect(() => {
    if (!isLiveSyncing) return;
    const interval = setInterval(() => {
      refreshNow();
    }, syncIntervalSec * 1000);
    return () => clearInterval(interval);
  }, [isLiveSyncing, syncIntervalSec, refreshNow]);

  const toggleLiveSync = useCallback(() => {
    setIsLiveSyncing(prev => !prev);
  }, []);

  // Browser GPS Geolocation with fallback
  const requestGpsLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setIsGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        // Verify coordinates are approximately around Singapore
        if (latitude >= 1.15 && latitude <= 1.55 && longitude >= 103.55 && longitude <= 104.15) {
          setUserLocation({
            name: 'My GPS Location',
            lat: latitude,
            lng: longitude,
            isCustomGps: true,
          });
        } else {
          // Outside SG, default to Orchard Road with friendly note
          setUserLocation({
            name: 'Orchard Road (GPS defaulted to SG)',
            lat: 1.3048,
            lng: 103.8318,
            isCustomGps: true,
          });
          setGpsError('Detected coordinates outside Singapore. Defaulted to Orchard Road.');
        }
      },
      (err) => {
        setIsGpsLoading(false);
        setGpsError(err.message || 'Unable to retrieve your location.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  // Filter & sort carparks
  const filteredCarparks = useMemo(() => {
    const list = carparks.map(cp => {
      const distanceKm = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        cp.coordinates.lat,
        cp.coordinates.lng
      );
      return { ...cp, distanceKm };
    });

    return list.filter(cp => {
      // Search query matches name, address, postalCode, or carparkNumber
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchName = cp.name.toLowerCase().includes(q);
        const matchAddress = cp.address.toLowerCase().includes(q);
        const matchPostal = cp.postalCode.includes(q);
        const matchCode = cp.carparkNumber.toLowerCase().includes(q);
        if (!matchName && !matchAddress && !matchPostal && !matchCode) {
          return false;
        }
      }

      // Agency filter
      if (filters.agency !== 'all' && cp.agency !== filters.agency) {
        return false;
      }

      // Region filter
      if (filters.region !== 'all' && cp.region !== filters.region) {
        return false;
      }

      // Height limit filter
      if (filters.minHeightLimit > 0 && cp.heightLimitMetres < filters.minHeightLimit) {
        return false;
      }

      // Free Sunday filter
      if (filters.hasFreeSunday && !cp.rates.isFreeParkingSunday) {
        return false;
      }

      // EV Chargers filter
      if (filters.hasEvChargers && (!cp.evCharging || cp.evCharging.available === 0)) {
        return false;
      }

      // Vehicle specific lot checks
      const info = getAvailabilityInfo(cp, filters.vehicleType);
      if (filters.onlyAvailable && info.available === 0) {
        return false;
      }

      if (filters.minAvailableLots > 0 && info.available < filters.minAvailableLots) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'distance') {
        return a.distanceKm - b.distanceKm;
      }
      if (filters.sortBy === 'lots-desc') {
        const lotsA = getAvailabilityInfo(a, filters.vehicleType).available;
        const lotsB = getAvailabilityInfo(b, filters.vehicleType).available;
        return lotsB - lotsA;
      }
      if (filters.sortBy === 'lots-asc') {
        const lotsA = getAvailabilityInfo(a, filters.vehicleType).available;
        const lotsB = getAvailabilityInfo(b, filters.vehicleType).available;
        return lotsA - lotsB;
      }
      if (filters.sortBy === 'price') {
        return a.rates.hourlyBaseRate - b.rates.hourlyBaseRate;
      }
      if (filters.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [carparks, userLocation, filters]);

  // Overall KPI statistics
  const kpiStats = useMemo(() => {
    let totalLots = 0;
    let availableLots = 0;
    let evAvailable = 0;
    let freeSundayCount = 0;

    carparks.forEach(cp => {
      totalLots += cp.lots.car.total;
      availableLots += cp.lots.car.available;
      if (cp.evCharging) {
        evAvailable += cp.evCharging.available;
      }
      if (cp.rates.isFreeParkingSunday) {
        freeSundayCount += 1;
      }
    });

    const avgOccupancy = totalLots > 0 ? Math.round(((totalLots - availableLots) / totalLots) * 100) : 0;

    return {
      totalLots,
      availableLots,
      evAvailable,
      freeSundayCount,
      avgOccupancy,
    };
  }, [carparks]);

  return (
    <CarparkContext.Provider
      value={{
        carparks,
        lastSyncTime,
        isLiveSyncing,
        syncIntervalSec,
        setSyncIntervalSec,
        toggleLiveSync,
        refreshNow,
        userLocation,
        setUserLocation,
        requestGpsLocation,
        isGpsLoading,
        gpsError,
        filters,
        setFilters,
        resetFilters,
        selectedCarpark,
        setSelectedCarpark,
        favorites,
        toggleFavorite,
        isFavorite,
        viewMode,
        setViewMode,
        isFeeCalcOpen,
        setIsFeeCalcOpen,
        feeCalcTarget,
        openFeeCalc,
        isBackendDocsOpen,
        setIsBackendDocsOpen,
        isLtaConnected,
        ltaStatusMessage,
        isLtaLoading,
        filteredCarparks,
        kpiStats,
      }}
    >
      {children}
    </CarparkContext.Provider>
  );
};

export const useCarpark = () => {
  const context = useContext(CarparkContext);
  if (!context) {
    throw new Error('useCarpark must be used within a CarparkProvider');
  }
  return context;
};
