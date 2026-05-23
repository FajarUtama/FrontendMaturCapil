/** Bounding box Kota Semarang — selaras validasi backend */
export const SEMARANG_BOUNDS = {
  latMin: -7.15,
  latMax: -6.85,
  lngMin: 110.25,
  lngMax: 110.55,
};

export const SEMARANG_CENTER = {
  lat: -6.9822,
  lng: 110.4091,
};

export const SEMARANG_LEAFLET_BOUNDS = [
  [SEMARANG_BOUNDS.latMin, SEMARANG_BOUNDS.lngMin],
  [SEMARANG_BOUNDS.latMax, SEMARANG_BOUNDS.lngMax],
];

export const isInSemarangBounds = (lat, lng) =>
  lat >= SEMARANG_BOUNDS.latMin &&
  lat <= SEMARANG_BOUNDS.latMax &&
  lng >= SEMARANG_BOUNDS.lngMin &&
  lng <= SEMARANG_BOUNDS.lngMax;
