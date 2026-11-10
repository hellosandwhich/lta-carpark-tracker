/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CarparkProvider, useCarpark } from './context/CarparkContext';
import { Header } from './components/Header';
import { HubLocationSelector } from './components/HubLocationSelector';
import { KpiBar } from './components/KpiBar';
import { FilterToolbar } from './components/FilterToolbar';
import { CarparkCard } from './components/CarparkCard';
import { CarparkMap } from './components/CarparkMap';
import { CarparkModal } from './components/CarparkModal';
import { FeeCalculatorModal } from './components/FeeCalculatorModal';
import { BackendDocsModal } from './components/BackendDocsModal';
import { RotateCcw, Compass, MapPin, Database } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    filteredCarparks,
    carparks,
    viewMode,
    resetFilters,
    setIsBackendDocsOpen,
  } = useCarpark();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      <Header />
      <HubLocationSelector />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Strip */}
        <KpiBar />

        {/* Search, Filter & View Controls */}
        <FilterToolbar />

        {/* View Mode 1: Split View (Map + List) */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Carpark Cards List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 px-1">
                <span className="font-medium">
                  Showing <strong className="text-neutral-900 dark:text-white font-mono">{filteredCarparks.length}</strong> of {carparks.length} carparks
                </span>
                <span>Select any card to locate on map</span>
              </div>

              {filteredCarparks.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    No carparks found
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Try adjusting your search terms, changing the vehicle type, or resetting filters.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCarparks.map((cp) => (
                    <CarparkCard key={cp.id} carpark={cp} />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Sticky Interactive Leaflet Map */}
            <div className="lg:col-span-5 sticky top-20 h-[640px]">
              <CarparkMap />
            </div>
          </div>
        )}

        {/* View Mode 2: Full Map View */}
        {viewMode === 'map' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 px-1">
              <span>Interactive Leaflet Map · Singapore EPS Network</span>
              <span className="font-mono">{filteredCarparks.length} Carparks Displayed</span>
            </div>
            <div className="w-full h-[720px] rounded-xl overflow-hidden shadow-xs">
              <CarparkMap />
            </div>
          </div>
        )}

        {/* View Mode 3: Directory Grid View */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 px-1">
              <span className="font-medium">
                Directory Grid · Showing <strong className="text-neutral-900 dark:text-white font-mono">{filteredCarparks.length}</strong> carparks
              </span>
            </div>

            {filteredCarparks.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                <Compass className="w-8 h-8 text-neutral-400 mx-auto" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  No carparks match your filters
                </h3>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-xs font-semibold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCarparks.map((cp) => (
                  <CarparkCard key={cp.id} carpark={cp} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Backend Connect Banner for Developer Visibility */}
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                Frontend Architecture Ready for Backend Connection
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Data structures match official Singapore LTA DataMall (CarParkAvailabilityv2) & Data.gov.sg APIs. Live simulation running client-side.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBackendDocsOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Inspect API & Schemas
          </button>
        </div>
      </main>

      {/* Clean Anti-Slop Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 dark:text-white">ParkSG</span>
            <span aria-hidden="true">·</span>
            <span>Real-Time Singapore Carpark Availability</span>
            <span aria-hidden="true">·</span>
            <span>HDB, URA & Commercial Coverage</span>
          </div>

          <div className="flex items-center gap-4">
            <span>EPS Barrier Compatible</span>
            <span aria-hidden="true">·</span>
            <span>ERP 2.0 Ready</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsBackendDocsOpen(true)}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Developer Integration Specs
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CarparkModal />
      <FeeCalculatorModal />
      <BackendDocsModal />
    </div>
  );
};

export default function App() {
  return (
    <CarparkProvider>
      <MainLayout />
    </CarparkProvider>
  );
}
