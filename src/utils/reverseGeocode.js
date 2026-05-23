/**
 * Reverse geocoding via Nominatim (OpenStreetMap).
 * @see https://operations.osmfoundation.org/policies/nominatim/
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
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'id',
    },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.display_name || null;
};
