import React, { useState, useEffect } from 'react';
import { useCarpark } from '../context/CarparkContext';
import { Locate, Moon, Sun, RefreshCw, Radio } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    requestGpsLocation,
    isGpsLoading,
    refreshNow,
    isLiveSyncing,
    toggleLiveSync,
    lastSyncTime,
    isLtaConnected,
    isLtaLoading,
    setIsFeeCalcOpen,
    setIsBackendDocsOpen,
    setViewMode,
    setFilters,
  } = useCarpark();

  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const handleNavClick = (target: 'map' | 'directory' | 'fee' | 'ev' | 'api') => {
    if (target === 'map') {
      setViewMode('map');
    } else if (target === 'directory') {
      setViewMode('list');
    } else if (target === 'fee') {
      setIsFeeCalcOpen(true);
    } else if (target === 'ev') {
      setFilters(prev => ({ ...prev, vehicleType: 'ev', hasEvChargers: true }));
      setViewMode('split');
    } else if (target === 'api') {
      setIsBackendDocsOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setViewMode('split');
            }}
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap shrink-0 group"
          >
            <span className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm group-hover:bg-rose-700 transition-colors">
              P
            </span>
            <span>ParkSG</span>
          </a>

          {/* Zone 2: 4–5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            <button
              onClick={() => handleNavClick('map')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Live Map
            </button>
            <button
              onClick={() => handleNavClick('directory')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Directory
            </button>
            <button
              onClick={() => handleNavClick('fee')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Fee Estimator
            </button>
            <button
              onClick={() => handleNavClick('ev')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              EV Network
            </button>
            <button
              onClick={() => handleNavClick('api')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Backend API
            </button>
          </nav>

          {/* Zone 3: 1 primary action + theme/sync utilities */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Live simulation / LTA status toggle */}
            <button
              onClick={toggleLiveSync}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isLtaConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                  : isLiveSyncing
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
              }`}
              title={
                isLtaConnected
                  ? 'Connected to Live Singapore LTA DataMall v2 stream'
                  : isLiveSyncing
                  ? 'Simulation active (Configure LTA_DATAMALL_ACCOUNT_KEY in .env for live LTA stream)'
                  : 'Sync paused'
              }
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  isLiveSyncing
                    ? isLtaConnected
                      ? 'animate-pulse text-emerald-600 dark:text-emerald-400'
                      : 'animate-pulse text-blue-600 dark:text-blue-400'
                    : ''
                }`}
              />
              <span className="tabular-nums font-mono">
                {!isLiveSyncing ? 'Paused' : isLtaConnected ? 'LTA Live' : 'Sim Sync'}
              </span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={refreshNow}
              disabled={isLtaLoading}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh availability now from /api/carparkavailability"
            >
              <RefreshCw className={`w-4 h-4 ${isLtaLoading ? 'animate-spin text-rose-600' : ''}`} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Primary Action Button: Locate Me */}
            <button
              onClick={requestGpsLocation}
              disabled={isGpsLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
            >
              <Locate className={`w-3.5 h-3.5 ${isGpsLoading ? 'animate-spin' : ''}`} />
              <span>{isGpsLoading ? 'Locating...' : 'Locate Me'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
