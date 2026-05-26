/**
 * Geolocation browser untuk titik laporan akurat.
 */

const ERROR_MESSAGES = {
  1: 'Izin lokasi ditolak. Aktifkan GPS/lokasi di pengaturan browser.',
  2: 'Sinyal GPS tidak tersedia. Coba di area terbuka atau pilih manual di peta.',
  3: 'Permintaan lokasi timeout. Coba lagi.',
};

/**
 * @returns {Promise<{ lat: number, lng: number, accuracy: number }>}
 */
export const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Perangkat/browser tidak mendukung GPS.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? 0,
        });
      },
      (err) => {
        const message = ERROR_MESSAGES[err.code] || err.message || 'Gagal mengambil lokasi GPS.';
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 20_000,
        maximumAge: 0,
      }
    );
  });
