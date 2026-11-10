import React from 'react';
import { Carpark } from '../types/carpark';
import { useCarpark } from '../context/CarparkContext';
import { getAvailabilityInfo, formatDistance, estimateDriveMinutes } from '../utils/geoUtils';
import { Star, Navigation, Calculator, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';

interface CarparkCardProps {
  carpark: Carpark & { distanceKm: number };
}

export const CarparkCard: React.FC<CarparkCardProps> = ({ carpark }) => {
  const {
    filters,
    selectedCarpark,
    setSelectedCarpark,
    isFavorite,
    toggleFavorite,
    openFeeCalc,
  } = useCarpark();

  const isSelected = selectedCarpark?.id === carpark.id;
  const isFav = isFavorite(carpark.id);
  const avail = getAvailabilityInfo(carpark, filters.vehicleType);
  const driveMins = estimateDriveMinutes(carpark.distanceKm);

  return (
    <div
      onClick={() => setSelectedCarpark(carpark)}
      className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-neutral-50 dark:bg-neutral-800/90 border-neutral-900 dark:border-white shadow-sm ring-1 ring-neutral-900 dark:ring-white'
          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      {/* Top Header: Agency & Number, Distance, Favorite */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="font-semibold text-neutral-900 dark:text-white uppercase">
            {carpark.agency}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">{carpark.carparkNumber}</span>
          <span aria-hidden="true">·</span>
          <span>{carpark.carparkType}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300 tabular-nums">
            {formatDistance(carpark.distanceKm)} ({driveMins}m drive)
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(carpark.id);
            }}
            className={`p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ${
              isFav ? 'text-amber-500' : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500'
            }`}
            title={isFav ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Carpark Title & Address */}
      <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug">
        {carpark.name}
      </h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mb-3">
        {carpark.address} (S{carpark.postalCode})
      </p>

      {/* Lot Availability Gauge & Numbers */}
      <div className="p-3 mb-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800">
        <div className="flex items-baseline justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 capitalize">
              {filters.vehicleType} Lots
            </span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${avail.badgeColor}`}>
              {avail.status}
            </span>
          </div>

          <div className="text-right">
            <span className="text-lg font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
              {avail.available}
            </span>
            <span className="text-xs text-neutral-500 font-mono tabular-nums">
              {' '}/ {avail.total}
            </span>
          </div>
        </div>

        {/* Linear gauge */}
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              avail.status === 'Full'
                ? 'bg-rose-500'
                : avail.status === 'Filling Fast'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${avail.percentageOccupied}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1 text-[10px] text-neutral-400 font-mono">
          <span>{avail.percentageOccupied}% occupied</span>
          <span>{avail.percentageAvailable.toFixed(0)}% free</span>
        </div>
      </div>

      {/* Features & Key Information Strip */}
      <div className="text-xs space-y-1 text-neutral-600 dark:text-neutral-400 mb-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate">
            <strong className="text-neutral-800 dark:text-neutral-200">Rate:</strong>{' '}
            {carpark.rates.weekdayDay}
          </span>
          <span className="font-mono text-[11px] text-neutral-500 shrink-0">
            {carpark.heightLimitMetres > 0 ? `Max ${carpark.heightLimitMetres}m` : 'Open'}
          </span>
        </div>

        {carpark.rates.isFreeParkingSunday && (
          <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>HDB Free Parking Scheme (Sundays/PH 07:30 - 22:30)</span>
          </div>
        )}

        {carpark.evCharging && (
          <div className="text-[11px] font-medium text-blue-700 dark:text-blue-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>
              {carpark.evCharging.available}/{carpark.evCharging.total} EV Plugs ({carpark.evCharging.operator} · {carpark.evCharging.powerKw}kW)
            </span>
          </div>
        )}

        {carpark.nearbyErp && (
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
            <span>ERP:</span>
            <span>{carpark.nearbyErp.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{carpark.nearbyErp.activeRate}</span>
          </div>
        )}
      </div>

      {/* Card Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCarpark(carpark);
          }}
          className="px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors cursor-pointer"
        >
          View Full Details
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openFeeCalc(carpark);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
            title="Estimate parking fee"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fee</span>
          </button>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Go</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
