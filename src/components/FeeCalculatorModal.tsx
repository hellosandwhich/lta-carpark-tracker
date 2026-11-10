import React, { useState } from 'react';
import { useCarpark } from '../context/CarparkContext';
import { Carpark } from '../types/carpark';
import { estimateParkingFee } from '../utils/geoUtils';
import { X, Calculator, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export const FeeCalculatorModal: React.FC = () => {
  const { isFeeCalcOpen, setIsFeeCalcOpen, feeCalcTarget, carparks } = useCarpark();

  const [selectedCarparkId, setSelectedCarparkId] = useState<string>(() => {
    return feeCalcTarget?.id || carparks[0]?.id || '';
  });

  const [dayType, setDayType] = useState<number>(1); // 1 = Weekday, 6 = Saturday, 0 = Sunday
  const [entryHour, setEntryHour] = useState<number>(14); // 2:00 PM default
  const [durationMinutes, setDurationMinutes] = useState<number>(120); // 2 hours default

  if (!isFeeCalcOpen) return null;

  const currentCarpark = carparks.find(c => c.id === selectedCarparkId) || carparks[0];

  const calculation = estimateParkingFee(
    currentCarpark,
    durationMinutes,
    dayType,
    entryHour
  );

  const durationHours = (durationMinutes / 60).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Singapore Parking Fee Estimator
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Calculates charges based on official HDB, URA & Mall published tariffs
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFeeCalcOpen(false)}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Carpark Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Select Carpark
            </label>
            <select
              value={currentCarpark.id}
              onChange={(e) => setSelectedCarparkId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
            >
              {carparks.map(cp => (
                <option key={cp.id} value={cp.id}>
                  [{cp.agency}] {cp.name} ({cp.rates.weekdayDay})
                </option>
              ))}
            </select>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Day of Entry
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDayType(1)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                  dayType === 1
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
                }`}
              >
                Weekday (Mon–Fri)
              </button>
              <button
                type="button"
                onClick={() => setDayType(6)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                  dayType === 6
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
                }`}
              >
                Saturday
              </button>
              <button
                type="button"
                onClick={() => setDayType(0)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                  dayType === 0
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
                }`}
              >
                Sunday / PH
              </button>
            </div>
          </div>

          {/* Entry Time of Day */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Entry Time: <span className="font-mono">{entryHour.toString().padStart(2, '0')}:00 hrs</span>
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setEntryHour(9)}
                  className="px-2 py-0.5 text-[11px] rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
                >
                  Morning (09:00)
                </button>
                <button
                  type="button"
                  onClick={() => setEntryHour(14)}
                  className="px-2 py-0.5 text-[11px] rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
                >
                  Afternoon (14:00)
                </button>
                <button
                  type="button"
                  onClick={() => setEntryHour(20)}
                  className="px-2 py-0.5 text-[11px] rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
                >
                  Night (20:00)
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="23"
              step="1"
              value={entryHour}
              onChange={(e) => setEntryHour(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>

          {/* Parking Duration */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Duration:{' '}
                <span className="font-mono text-neutral-900 dark:text-white font-bold">
                  {durationMinutes >= 60
                    ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60 ? `${durationMinutes % 60}m` : ''}`
                    : `${durationMinutes}m`}
                </span>
              </label>
              <div className="flex gap-1.5">
                {[10, 30, 60, 120, 240, 480].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`px-2 py-0.5 text-[11px] rounded transition-colors cursor-pointer ${
                      durationMinutes === mins
                        ? 'bg-rose-600 text-white font-semibold'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                    }`}
                  >
                    {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="range"
              min="10"
              max="720"
              step="10"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>

          {/* Result Calculation Card */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/80 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Estimated Parking Charge
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold font-mono tabular-nums text-rose-600 dark:text-rose-400">
                  ${calculation.fee.toFixed(2)}
                </span>
                <span className="text-xs text-neutral-500 font-mono">SGD</span>
              </div>
            </div>

            <div className="text-xs space-y-1.5 text-neutral-600 dark:text-neutral-300 pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{calculation.note}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Grace period allowed: {currentCarpark.rates.gracePeriodMinutes} mins</span>
              </div>
              {currentCarpark.rates.isFreeParkingSunday && (
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  ✓ Sunday Free Parking Scheme applies to this HDB MSCP (07:30 - 22:30).
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-100 dark:bg-neutral-950/60 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={() => setIsFeeCalcOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
