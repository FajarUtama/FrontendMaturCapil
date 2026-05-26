import { SEMARANG_BOUNDS } from '../constants/semarangMap';

const NOMINATIM_HEADERS = {
  Accept: 'application/json',
  'Accept-Language': 'id',
};

/** viewbox Nominatim: minLon, maxLat, maxLon, minLat */
const SEMARANG_VIEWBOX = [
  SEMARANG_BOUNDS.lngMin,
  SEMARANG_BOUNDS.latMax,
  SEMARANG_BOUNDS.lngMax,
  SEMARANG_BOUNDS.latMin,
].join(',');

/**
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string|null>}
 */
export const reverseGeocode = async (latitude, longitude) => {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: 'json',
    zoom: '18',
    addressdetails: '1',
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
    headers: NOMINATIM_HEADERS,
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.display_name || null;
};

/**
 * @param {string} query
 * @returns {Promise<Array<{ id: string, label: string, lat: number, lng: number }>>}
 */
export const searchLocations = async (query) => {
  const q = query.trim();
  if (q.length < 3) return [];

  const params = new URLSearchParams({
    q,
    format: 'json',
    limit: '6',
    countrycodes: 'id',
    viewbox: SEMARANG_VIEWBOX,
    bounded: '1',
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: NOMINATIM_HEADERS,
  });

  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    id: String(item.place_id),
    label: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
  }));
};
