import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { SEMARANG_LEAFLET_BOUNDS } from '../../constants/semarangMap';
import { configureLeafletIcons } from '../../utils/leafletSetup';
import 'leaflet/dist/leaflet.css';

configureLeafletIcons();

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

/**
 * Peta read-only untuk menampilkan lokasi laporan.
 */
export const ComplaintMapView = ({ latitude, longitude, className = '' }) => {
  if (latitude == null || longitude == null) return null;

  return (
    <div className={`h-40 sm:h-44 rounded-xl overflow-hidden border border-slate-200 z-0 ${className}`}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        minZoom={11}
        maxZoom={18}
        maxBounds={SEMARANG_LEAFLET_BOUNDS}
        scrollWheelZoom={false}
        dragging
        className="h-full w-full"
      >
        <TileLayer attribution={OSM_ATTRIBUTION} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[latitude, longitude]} />
      </MapContainer>
    </div>
  );
};
