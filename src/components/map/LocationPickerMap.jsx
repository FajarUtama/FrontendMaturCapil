import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import { Crosshair, Loader2, MapPin, Navigation, Search } from 'lucide-react';
import { SEMARANG_CENTER, SEMARANG_LEAFLET_BOUNDS, isInSemarangBounds } from '../../constants/semarangMap';
import { configureLeafletIcons } from '../../utils/leafletSetup';
import { reverseGeocode, searchLocations } from '../../utils/geocode';
import { getCurrentPosition } from '../../utils/geolocation';
import 'leaflet/dist/leaflet.css';

configureLeafletIcons();

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

const SOURCE_LABEL = {
  manual: 'Titik manual',
  gps: 'GPS lokasi saat ini',
  search: 'Hasil pencarian',
};

const MapEvents = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng, 'manual');
    },
  });
  return null;
};

const MapViewSync = ({ latitude, longitude, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([latitude, longitude], zoom ?? map.getZoom(), { animate: true });
  }, [latitude, longitude, zoom, map]);
  return null;
};

/**
 * Peta interaktif: ketuk/seret pin, GPS akurat, atau cari alamat.
 */
export const LocationPickerMap = ({
  latitude,
  longitude,
  onLocationChange,
  onAddressChange,
  className = '',
}) => {
  const [mapError, setMapError] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationSource, setLocationSource] = useState('manual');
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const geocodeTimer = useRef(null);
  const searchTimer = useRef(null);

  const applyAddress = useCallback(
    async (lat, lng, { fillAddress = true } = {}) => {
      if (!onAddressChange || !fillAddress) return;
      clearTimeout(geocodeTimer.current);
      setGeocoding(true);
      geocodeTimer.current = setTimeout(async () => {
        try {
          const addr = await reverseGeocode(lat, lng);
          if (addr) onAddressChange(addr);
        } catch {
          /* alamat bisa diisi manual */
        } finally {
          setGeocoding(false);
        }
      }, 400);
    },
    [onAddressChange]
  );

  const handlePick = useCallback(
    (lat, lng, source = 'manual', options = {}) => {
      setMapError('');
      if (!isInSemarangBounds(lat, lng)) {
        setMapError('Lokasi harus berada di wilayah Kota Semarang.');
        return false;
      }
      setLocationSource(source);
      if (options.accuracy != null) setGpsAccuracy(options.accuracy);
      else if (source !== 'gps') setGpsAccuracy(null);

      onLocationChange(lat, lng);
      setMapZoom(options.zoom ?? (source === 'search' ? 17 : 16));
      applyAddress(lat, lng, { fillAddress: options.fillAddress !== false });
      return true;
    },
    [onLocationChange, applyAddress]
  );

  const handleUseGps = async () => {
    setMapError('');
    setGpsLoading(true);
    setShowResults(false);
    try {
      const pos = await getCurrentPosition();
      const ok = handlePick(pos.lat, pos.lng, 'gps', {
        accuracy: pos.accuracy,
        zoom: 17,
        fillAddress: true,
      });
      if (!ok && pos.accuracy) setGpsAccuracy(pos.accuracy);
    } catch (err) {
      setMapError(err instanceof Error ? err.message : 'Gagal mengambil lokasi GPS.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSearchInput = (value) => {
    setSearchQuery(value);
    setShowResults(true);
    clearTimeout(searchTimer.current);
    if (value.trim().length < 3) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await searchLocations(value);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 450);
  };

  const handleSelectSearch = (item) => {
    setSearchQuery(item.label.split(',')[0]);
    setSearchResults([]);
    setShowResults(false);
    handlePick(item.lat, item.lng, 'search', { zoom: 17, fillAddress: true });
    if (onAddressChange) onAddressChange(item.label);
  };

  useEffect(
    () => () => {
      clearTimeout(geocodeTimer.current);
      clearTimeout(searchTimer.current);
    },
    []
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchInput(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 180)}
          placeholder="Cari jalan, kelurahan, atau landmark di Semarang…"
          className="w-full bg-white border border-slate-200 focus:border-brand-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-brand-500/10"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-2.5 w-4 h-4 text-brand-500 animate-spin" />
        )}
        {showResults && searchResults.length > 0 && (
          <ul className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-44 overflow-y-auto">
            {searchResults.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2.5 text-[10px] text-slate-700 hover:bg-brand-50 border-b border-slate-50 last:border-0"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectSearch(item)}
                >
                  <MapPin className="w-3 h-3 inline mr-1 text-brand-500" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleUseGps}
          disabled={gpsLoading}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
        >
          {gpsLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          {gpsLoading ? 'Mengambil GPS…' : 'Gunakan lokasi saya'}
        </button>
        <button
          type="button"
          onClick={() => {
            setLocationSource('manual');
            setGpsAccuracy(null);
            handlePick(SEMARANG_CENTER.lat, SEMARANG_CENTER.lng, 'manual', { zoom: 13, fillAddress: false });
          }}
          className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-[10px] font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Crosshair className="w-3.5 h-3.5" />
          Pusat kota
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[9px]">
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
          {SOURCE_LABEL[locationSource] || 'Titik lokasi'}
        </span>
        {gpsAccuracy != null && locationSource === 'gps' && (
          <span className="text-emerald-700 font-semibold">Akurasi ±{Math.round(gpsAccuracy)} m</span>
        )}
        {geocoding && <span className="text-brand-600 font-semibold">Mencari alamat…</span>}
      </div>

      {/* Map */}
      <div className="relative h-52 sm:h-60 rounded-xl overflow-hidden border border-slate-200 shadow-xs z-0">
        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          minZoom={11}
          maxZoom={19}
          maxBounds={SEMARANG_LEAFLET_BOUNDS}
          maxBoundsViscosity={0.85}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer attribution={OSM_ATTRIBUTION} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {gpsAccuracy != null && locationSource === 'gps' && gpsAccuracy < 200 && (
            <Circle
              center={[latitude, longitude]}
              radius={gpsAccuracy}
              pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.12, weight: 1 }}
            />
          )}
          <Marker
            position={[latitude, longitude]}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                handlePick(lat, lng, 'manual', { fillAddress: true });
              },
            }}
          />
          <MapEvents onPick={handlePick} />
          <MapViewSync latitude={latitude} longitude={longitude} zoom={mapZoom} />
        </MapContainer>
      </div>

      <p className="text-[9px] text-slate-500 px-0.5">
        Ketuk peta, seret pin merah, gunakan GPS, atau cari alamat di kotak pencarian.
      </p>

      {mapError && <p className="text-[10px] text-rose-600 font-semibold">{mapError}</p>}

      <div className="flex justify-between text-[9px] text-slate-400 font-mono px-0.5">
        <span>Lat: {latitude.toFixed(6)}</span>
        <span>Lng: {longitude.toFixed(6)}</span>
      </div>
    </div>
  );
};

export { SEMARANG_CENTER };
