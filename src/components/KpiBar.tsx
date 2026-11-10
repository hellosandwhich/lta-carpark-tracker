import React from 'react';
import { useCarpark } from '../context/CarparkContext';
import { Car, Zap, ParkingSquare, Clock } from 'lucide-react';

export const KpiBar: React.FC = () => {
  const { kpiStats, lastSyncTime } = useCarpark();

  const formattedTime = lastSyncTime.toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* KPI 1: Available Lots */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Available Lots
          </span>
          <Car className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {kpiStats.availableLots.toLocaleString()}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
            / {kpiStats.totalLots.toLocaleString()} total
          </span>
        </div>
        <div className="mt-2 w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${100 - kpiStats.avgOccupancy}%` }}
          />
        </div>
      </div>

      {/* KPI 2: Islandwide Occupancy */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Avg Islandwide Occupancy
          </span>
          <span className="text-[11px] font-mono text-neutral-400">LTA / HDB</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {kpiStats.avgOccupancy}%
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            capacity filled
          </span>
        </div>
        <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <span>Central Peak Demand</span>
          <span aria-hidden="true">·</span>
          <span>EPS Active</span>
        </div>
      </div>

      {/* KPI 3: EV Fast Chargers */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            EV Fast Chargers
          </span>
          <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {kpiStats.evAvailable}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            plugs ready
          </span>
        </div>
        <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <span>SP · CDG ENGIE · Shell</span>
        </div>
      </div>

      {/* KPI 4: Sunday Free Parking Scheme */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Free Parking (FPS)
          </span>
          <ParkingSquare className="w-4 h-4 text-rose-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            {kpiStats.freeSundayCount}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            qualifying HDBs
          </span>
        </div>
        <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          <span className="tabular-nums font-mono">Last sync: {formattedTime}</span>
        </div>
      </div>
    </div>
  );
};
