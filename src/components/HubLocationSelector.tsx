import React from 'react';
import { useCarpark } from '../context/CarparkContext';
import { SINGAPORE_LOCATIONS } from '../data/singaporeCarparks';
import { MapPin, Navigation } from 'lucide-react';

export const HubLocationSelector: React.FC = () => {
  const { userLocation, setUserLocation, gpsError } = useCarpark();

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Current Origin Notice */}
        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 shrink-0">
          <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Active Origin:</span>
          <span className="font-semibold text-neutral-900 dark:text-white">
            {userLocation.name}
          </span>
          {userLocation.isCustomGps && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
              <Navigation className="w-3 h-3" /> Live GPS
            </span>
          )}
        </div>

        {/* Hub Preset Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider shrink-0 mr-1">
            SG Hubs:
          </span>
          {SINGAPORE_LOCATIONS.map((hub) => {
            const isActive = !userLocation.isCustomGps && userLocation.name === hub.name;
            return (
              <button
                key={hub.name}
                onClick={() => setUserLocation(hub)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {hub.name}
              </button>
            );
          })}
        </div>
      </div>

      {gpsError && (
        <div className="max-w-7xl mx-auto mt-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded border border-amber-200 dark:border-amber-800">
          {gpsError}
        </div>
      )}
    </div>
  );
};
