import React from 'react';
import { useCarpark } from '../context/CarparkContext';
import { formatDistance, estimateDriveMinutes } from '../utils/geoUtils';
import { X, Navigation, Calculator, Star, Zap, ShieldCheck, MapPin, Clock, ArrowUpRight, Share2, AlertTriangle } from 'lucide-react';

export const CarparkModal: React.FC = () => {
  const {
    selectedCarpark,
    setSelectedCarpark,
    userLocation,
    isFavorite,
    toggleFavorite,
    openFeeCalc,
  } = useCarpark();

  if (!selectedCarpark) return null;

  const cp = selectedCarpark;
  const isFav = isFavorite(cp.id);
  const distanceKm = formatDistance(
    // Calculate distance on the fly if needed
    cp.coordinates ? Math.sqrt(
      Math.pow((userLocation.lat - cp.coordinates.lat) * 111, 2) +
      Math.pow((userLocation.lng - cp.coordinates.lng) * 111, 2)
    ) : 0
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/#${cp.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
              <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                {cp.agency}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{cp.carparkNumber}</span>
              <span aria-hidden="true">·</span>
              <span>{cp.region} Singapore</span>
              <span aria-hidden="true">·</span>
              <span>{cp.carparkType}</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              {cp.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{cp.address} (Postal {cp.postalCode})</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleFavorite(cp.id)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isFav
                  ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-500'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
              }`}
              title={isFav ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => setSelectedCarpark(null)}
              className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Live Lots Breakdown Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
              Real-Time Lot Availability
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Cars */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-100 dark:border-neutral-800 text-center">
                <span className="text-xs text-neutral-500 block mb-1">Cars</span>
                <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
                  {cp.lots.car.available}
                </span>
                <span className="text-xs text-neutral-400 block font-mono">
                  / {cp.lots.car.total} lots
                </span>
              </div>

              {/* Motorcycles */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-100 dark:border-neutral-800 text-center">
                <span className="text-xs text-neutral-500 block mb-1">Motorcycles</span>
                <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
                  {cp.lots.motorcycle.available}
                </span>
                <span className="text-xs text-neutral-400 block font-mono">
                  / {cp.lots.motorcycle.total} lots
                </span>
              </div>

              {/* EV Chargers */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-100 dark:border-neutral-800 text-center">
                <span className="text-xs text-neutral-500 block mb-1 flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" /> EV Fast
                </span>
                <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {cp.evCharging ? cp.evCharging.available : 0}
                </span>
                <span className="text-xs text-neutral-400 block font-mono">
                  / {cp.evCharging ? cp.evCharging.total : 0} plugs
                </span>
              </div>

              {/* Accessible Lots */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-100 dark:border-neutral-800 text-center">
                <span className="text-xs text-neutral-500 block mb-1">Accessible</span>
                <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
                  {cp.accessibleLots.available}
                </span>
                <span className="text-xs text-neutral-400 block font-mono">
                  / {cp.accessibleLots.total} lots
                </span>
              </div>
            </div>
          </div>

          {/* EV Charging Provider Info */}
          {cp.evCharging && (
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>EV Charging Hub: {cp.evCharging.operator}</span>
              </div>
              <div className="text-xs text-emerald-800 dark:text-emerald-400 flex flex-wrap gap-x-4 gap-y-1">
                <span>Power: <strong className="font-mono">{cp.evCharging.powerKw} kW Fast DC/AC</strong></span>
                <span>Connector: <strong className="font-mono">{cp.evCharging.connectorType}</strong></span>
                <span>Payment: App / RFID (SP Utilities, CDG ENGIE, Shell Recharge)</span>
              </div>
            </div>
          )}

          {/* Published Parking Rates */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
              Official Parking Rates & Policies
            </h4>
            <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
              <div className="p-3 flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">Weekday Daytime:</span>
                <span className="font-semibold text-neutral-900 dark:text-white text-right">{cp.rates.weekdayDay}</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">Weekday Night:</span>
                <span className="font-semibold text-neutral-900 dark:text-white text-right">{cp.rates.weekdayNight}</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">Saturday:</span>
                <span className="font-semibold text-neutral-900 dark:text-white text-right">{cp.rates.saturday}</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">Sunday & Public Holidays:</span>
                <span className={`font-semibold text-right ${cp.rates.isFreeParkingSunday ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-neutral-900 dark:text-white'}`}>
                  {cp.rates.sundayPublicHoliday}
                </span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">Grace Period:</span>
                <span className="font-mono font-semibold text-neutral-900 dark:text-white text-right">
                  {cp.rates.gracePeriodMinutes} minutes (Drop-off & pick-up)
                </span>
              </div>
            </div>
          </div>

          {/* Operational & Gantry Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
              Gantry & Access Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <span className="text-neutral-500 block mb-1">Vehicle Height Clearance</span>
                <span className="text-base font-bold font-mono text-neutral-900 dark:text-white">
                  {cp.heightLimitMetres > 0 ? `${cp.heightLimitMetres.toFixed(2)} metres` : 'No Height Barrier (Open-Air)'}
                </span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  {cp.heightLimitMetres <= 2.0 ? 'Caution: Low clearance for large vans/SUVs' : 'Standard clearance for most vehicles'}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <span className="text-neutral-500 block mb-1">Gantry Barrier System</span>
                <span className="text-base font-bold text-neutral-900 dark:text-white">
                  {cp.electronicParking ? 'EPS (Electronic Parking System)' : 'Coupon / Parking.sg App'}
                </span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  NETS FlashPay, CEPAS, CashCard & ERP 2.0 OBU supported
                </span>
              </div>
            </div>
          </div>

          {/* Nearby ERP Gantry notice */}
          {cp.nearbyErp && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>ERP Gantry in Vicinity</span>
              </div>
              <p className="text-amber-800 dark:text-amber-400">
                Approaching via <strong>{cp.nearbyErp.name}</strong> (~{cp.nearbyErp.distanceMetres}m away).
                Current active rate: <strong className="font-mono">{cp.nearbyErp.activeRate}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-neutral-50 dark:bg-neutral-950/60 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              openFeeCalc(cp);
              setSelectedCarpark(null);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>Calculate Parking Fee</span>
          </button>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${cp.coordinates.lat},${cp.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Start Navigation</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
