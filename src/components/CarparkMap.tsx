import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useCarpark } from '../context/CarparkContext';
import { getAvailabilityInfo, formatDistance } from '../utils/geoUtils';
import { Carpark } from '../types/carpark';

export const CarparkMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const {
    filteredCarparks,
    selectedCarpark,
    setSelectedCarpark,
    userLocation,
    filters,
    openFeeCalc,
  } = useCarpark();

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || leafletMapRef.current) return;

    // Centered on Singapore
    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
    });

    // Add CartoDB Positron / OSM tiles for clean modern basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Update User Location Marker
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Remove previous user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Custom blue radar icon for user's active Singapore position
    const userIcon = L.divIcon({
      className: 'user-location-pin',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 bg-blue-500/20 rounded-full animate-ping"></div>
          <div class="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    marker.bindTooltip(
      `<div class="text-xs font-semibold px-1 py-0.5">${userLocation.name}</div>`,
      { direction: 'top', offset: [0, -10] }
    );

    userMarkerRef.current = marker;

    // Pan map smoothly to user location
    map.panTo([userLocation.lat, userLocation.lng], { animate: true, duration: 0.6 });
  }, [userLocation]);

  // Update Carpark Markers whenever data or filters change
  useEffect(() => {
    const map = leafletMapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    filteredCarparks.forEach((cp) => {
      const availInfo = getAvailabilityInfo(cp, filters.vehicleType);
      const isSelected = selectedCarpark?.id === cp.id;

      // Color coding: emerald (plenty), amber (moderate), rose (full)
      let bgClass = 'bg-emerald-600 text-white border-white';
      if (availInfo.status === 'Full') {
        bgClass = 'bg-rose-600 text-white border-white';
      } else if (availInfo.status === 'Filling Fast') {
        bgClass = 'bg-amber-500 text-neutral-900 border-white';
      }

      const ringClass = isSelected ? 'ring-4 ring-neutral-900/40 scale-110' : 'hover:scale-110';
      const evIcon = cp.evCharging && cp.evCharging.available > 0
        ? `<span class="ml-0.5 text-[9px] font-bold text-emerald-200">⚡</span>`
        : '';

      const markerHtml = `
        <div class="group relative flex items-center justify-center transition-transform ${ringClass}">
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shadow-md border-2 ${bgClass} whitespace-nowrap">
            <span class="tabular-nums font-mono">${availInfo.available}</span>
            ${evIcon}
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 ${bgClass}"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'carpark-marker-container',
        html: markerHtml,
        iconSize: [44, 26],
        iconAnchor: [22, 26],
      });

      const marker = L.marker([cp.coordinates.lat, cp.coordinates.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 500 : 100,
      });

      // Bind rich popup
      const popupHtml = `
        <div class="p-3 max-w-[260px] text-neutral-900 font-sans">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">${cp.agency} · ${cp.carparkNumber}</span>
            <span class="text-[11px] font-mono text-neutral-500">${formatDistance(cp.distanceKm)}</span>
          </div>
          <h4 class="text-sm font-bold text-neutral-900 leading-tight mb-2">${cp.name}</h4>
          
          <div class="p-2 mb-2 rounded bg-neutral-100 flex items-center justify-between text-xs">
            <span class="text-neutral-600">Available Lots:</span>
            <span class="font-bold text-neutral-900 font-mono">${availInfo.available} <span class="text-neutral-400 font-normal">/ ${availInfo.total}</span></span>
          </div>

          <div class="text-[11px] text-neutral-600 space-y-1 mb-3">
            <div><strong class="text-neutral-800">Rate:</strong> ${cp.rates.weekdayDay}</div>
            ${cp.rates.isFreeParkingSunday ? '<div class="text-emerald-700 font-medium">✓ Sunday Free Parking Scheme</div>' : ''}
            ${cp.evCharging ? `<div class="text-blue-700 font-medium">⚡ ${cp.evCharging.available}/${cp.evCharging.total} EV (${cp.evCharging.operator})</div>` : ''}
          </div>

          <div class="flex gap-2 pt-1 border-t border-neutral-200">
            <button id="popup-select-${cp.id}" class="flex-1 py-1.5 text-xs font-semibold text-center text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors">
              Details
            </button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${cp.coordinates.lat},${cp.coordinates.lng}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-200 rounded hover:bg-neutral-300 transition-colors">
              Go
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { minWidth: 240 });

      marker.on('click', () => {
        setSelectedCarpark(cp);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-select-${cp.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedCarpark(cp);
          };
        }
      });

      marker.addTo(layer);
    });
  }, [filteredCarparks, selectedCarpark, filters, setSelectedCarpark]);

  // Center on selected carpark when changed
  useEffect(() => {
    if (!selectedCarpark || !leafletMapRef.current) return;
    leafletMapRef.current.flyTo(
      [selectedCarpark.coordinates.lat, selectedCarpark.coordinates.lng],
      15,
      { duration: 0.8 }
    );
  }, [selectedCarpark]);

  const handleResetView = () => {
    if (!leafletMapRef.current) return;
    leafletMapRef.current.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 0.8 });
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map floating control overlay */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 text-xs font-medium">
          <button
            onClick={handleResetView}
            className="px-2.5 py-1 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
            title="Recenter on current Singapore hub"
          >
            Center on Hub
          </button>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <span className="px-2 py-1 text-neutral-500 dark:text-neutral-400 tabular-nums font-mono text-[11px]">
            {filteredCarparks.length} Carparks
          </span>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-3 px-3 py-1.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400">
        <span className="flex items-center gap-1 font-medium text-neutral-800 dark:text-neutral-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Plenty (&gt;20%)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Filling Fast
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> &lt;5% / Full
        </span>
        <span className="flex items-center gap-1">
          <span className="text-emerald-600 font-bold">⚡</span> EV Fast Charger
        </span>
      </div>
    </div>
  );
};
