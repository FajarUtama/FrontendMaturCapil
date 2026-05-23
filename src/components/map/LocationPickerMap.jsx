import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { SEMARANG_CENTER, SEMARANG_LEAFLET_BOUNDS, isInSemarangBounds } from '../../constants/semarangMap';
import { configureLeafletIcons } from '../../utils/leafletSetup';
import { reverseGeocode } from '../../utils/reverseGeocode';
import 'leaflet/dist/leaflet.css';

configureLeafletIcons();

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

const MapEvents = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapViewSync = ({ latitude, longitude }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom(), { animate: true });
  }, [latitude, longitude, map]);
  return null;
};

/**
 * Peta interaktif OpenStreetMap untuk memilih lokasi laporan.
 */
export const LocationPickerMap = ({
  latitude,
  longitude,
  onLocationChange,
  onAddressSuggest,
  className = '',
}) => {
  const [geocoding, setGeocoding] = useState(false);
  const [mapError, setMapError] = useState('');
  const geocodeTimer = useRef(null);

  const handlePick = (lat, lng) => {
    setMapError('');
    if (!isInSemarangBounds(lat, lng)) {
      setMapError('Lokasi harus berada di wilayah Kota Semarang.');
      return;
    }
    onLocationChange(lat, lng);

    if (onAddressSuggest) {
      clearTimeout(geocodeTimer.current);
      setGeocoding(true);
      geocodeTimer.current = setTimeout(async () => {
        try {
          const address = await reverseGeocode(lat, lng);
          if (address) onAddressSuggest(address);
        } catch {
          /* abaikan — alamat bisa diisi manual */
        } finally {
          setGeocoding(false);
        }
      }, 600);
    }
  };

  useEffect(() => () => clearTimeout(geocodeTimer.current), []);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="relative h-52 sm:h-56 rounded-xl overflow-hidden border border-slate-200 shadow-xs z-0">
        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          minZoom={11}
          maxZoom={18}
          maxBounds={SEMARANG_LEAFLET_BOUNDS}
          maxBoundsViscosity={0.85}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer attribution={OSM_ATTRIBUTION} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[latitude, longitude]} />
          <MapEvents onPick={handlePick} />
          <MapViewSync latitude={latitude} longitude={longitude} />
        </MapContainer>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2 text-[9px] text-slate-500 px-0.5">
        <span>Ketuk peta untuk menandai lokasi kejadian</span>
        {geocoding && <span className="text-brand-600 font-semibold">Mencari alamat…</span>}
      </div>

      {mapError && <p className="text-[10px] text-rose-600 font-semibold">{mapError}</p>}

      <div className="flex justify-between text-[9px] text-slate-400 font-mono px-0.5">
        <span>Lat: {latitude.toFixed(5)}</span>
        <span>Lng: {longitude.toFixed(5)}</span>
      </div>
    </div>
  );
};

export { SEMARANG_CENTER };
