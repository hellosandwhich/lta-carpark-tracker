import React from 'react';
import { useCarpark } from '../context/CarparkContext';
import { VehicleCategory, AgencyType, RegionType } from '../types/carpark';
import { Search, X, SlidersHorizontal, Map, List, Columns, Car, Bike, Truck, Zap } from 'lucide-react';

export const FilterToolbar: React.FC = () => {
  const { filters, setFilters, resetFilters, viewMode, setViewMode } = useCarpark();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const clearSearch = () => {
    setFilters(prev => ({ ...prev, searchQuery: '' }));
  };

  const setVehicleType = (vt: VehicleCategory) => {
    setFilters(prev => ({ ...prev, vehicleType: vt }));
  };

  const setAgency = (agency: 'all' | AgencyType) => {
    setFilters(prev => ({ ...prev, agency }));
  };

  const setRegion = (region: 'all' | RegionType) => {
    setFilters(prev => ({ ...prev, region }));
  };

  const isFiltered =
    filters.searchQuery !== '' ||
    filters.agency !== 'all' ||
    filters.region !== 'all' ||
    filters.vehicleType !== 'car' ||
    filters.onlyAvailable ||
    filters.hasEvChargers ||
    filters.hasFreeSunday ||
    filters.minHeightLimit > 0 ||
    filters.sortBy !== 'distance';

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3.5">
      {/* Row 1: Search & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search carparks by name, street, postal code (e.g. 238801) or code (TP1)..."
            className="w-full pl-10 pr-9 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Buttons (Split / Map / List) */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg self-end sm:self-auto shrink-0">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'split'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Split Map and List View"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'map'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Full Map View"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Map</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Directory Grid View"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Directory</span>
          </button>
        </div>
      </div>

      {/* Row 2: Vehicle Type Tabs & Agency Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-neutral-100 dark:border-neutral-800">
        {/* Vehicle Types */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-x-auto">
          <button
            onClick={() => setVehicleType('car')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              filters.vehicleType === 'car'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Cars
          </button>
          <button
            onClick={() => setVehicleType('motorcycle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              filters.vehicleType === 'motorcycle'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            Motorcycles
          </button>
          <button
            onClick={() => setVehicleType('ev')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              filters.vehicleType === 'ev'
                ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            EV Chargers
          </button>
          <button
            onClick={() => setVehicleType('heavyVehicle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              filters.vehicleType === 'heavyVehicle'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Heavy Vehicles
          </button>
        </div>

        {/* Agency Filters */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {(['all', 'HDB', 'URA', 'Commercial', 'LTA'] as const).map(agency => (
            <button
              key={agency}
              onClick={() => setAgency(agency)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                filters.agency === agency
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {agency === 'all' ? 'All Operators' : agency}
            </button>
          ))}
        </div>
      </div>

      {/* Row 3: Quick Filter Toggles & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Only Available Toggle */}
          <button
            onClick={() => setFilters(prev => ({ ...prev, onlyAvailable: !prev.onlyAvailable }))}
            className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
              filters.onlyAvailable
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
          >
            ✓ Lots Available Only
          </button>

          {/* Sunday Free Parking Toggle */}
          <button
            onClick={() => setFilters(prev => ({ ...prev, hasFreeSunday: !prev.hasFreeSunday }))}
            className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
              filters.hasFreeSunday
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700'
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
          >
            Sunday Free Parking (FPS)
          </button>

          {/* Has EV Chargers Toggle */}
          <button
            onClick={() => setFilters(prev => ({ ...prev, hasEvChargers: !prev.hasEvChargers }))}
            className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
              filters.hasEvChargers
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700'
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
          >
            ⚡ EV Chargers
          </button>

          {/* Region Selector */}
          <select
            value={filters.region}
            onChange={(e) => setRegion(e.target.value as 'all' | RegionType)}
            className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs focus:outline-none"
          >
            <option value="all">All SG Regions</option>
            <option value="Central">Central (CBD & Orchard)</option>
            <option value="East">East (Tampines, Bedok, Changi)</option>
            <option value="West">West (Jurong, Clementi)</option>
            <option value="North">North (Woodlands)</option>
            <option value="North-East">North-East (AMK, Serangoon)</option>
          </select>

          {/* Height limit selector */}
          <select
            value={filters.minHeightLimit}
            onChange={(e) => setFilters(prev => ({ ...prev, minHeightLimit: Number(e.target.value) }))}
            className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs focus:outline-none"
          >
            <option value={0}>Height: Any</option>
            <option value={2.0}>Min 2.0m Clearance</option>
            <option value={2.1}>Min 2.1m Clearance</option>
          </select>
        </div>

        {/* Sort and Reset */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs font-medium focus:outline-none"
            >
              <option value="distance">Nearest Distance</option>
              <option value="lots-desc">Most Lots Available</option>
              <option value="lots-asc">Fewest Lots (Critical First)</option>
              <option value="price">Lowest Base Rate</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="px-2 py-1 text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
