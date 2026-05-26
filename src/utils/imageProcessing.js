/** Rasio lebar/tinggi yang diizinkan (hindari strip/panorama ekstrem) */
export const MIN_ASPECT_RATIO = 0.4;
export const MAX_ASPECT_RATIO = 2.5;

export const MAX_RAW_FILE_BYTES = 15 * 1024 * 1024;
export const MAX_OUTPUT_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 2400;

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const loadBitmap = async (file) => {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return createImageBitmap(file);
  }
};

const canvasToJpegBlob = (canvas, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Gagal mengompresi gambar.'))),
      'image/jpeg',
      quality
    );
  });

/**
 * Koreksi orientasi EXIF, normalisasi rasio, kompresi JPEG.
 * @param {File} file
 * @returns {Promise<{ preview: string, blob: Blob, dataUrl: string }>}
 */
export const processComplaintImageFile = async (file) => {
  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new Error('Format tidak didukung. Gunakan JPG, PNG, atau WebP.');
  }
  if (file.size > MAX_RAW_FILE_BYTES) {
    throw new Error('Ukuran file terlalu besar (maks. 15MB sebelum diproses).');
  }

  const bitmap = await loadBitmap(file);
  const width = bitmap.width;
  const height = bitmap.height;
  const aspect = width / height;

  if (aspect < MIN_ASPECT_RATIO || aspect > MAX_ASPECT_RATIO) {
    bitmap.close?.();
    const label =
      aspect < MIN_ASPECT_RATIO
        ? 'terlalu tinggi/panjang (portrait ekstrem)'
        : 'terlalu lebar (landscape ekstrem)';
    throw new Error(
      `Rasio foto tidak wajar — ${label}. Gunakan foto dengan proporsi normal (mis. 3:4 hingga 4:3).`
    );
  }

  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
  const outW = Math.max(1, Math.round(width * scale));
  const outH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close?.();
    throw new Error('Browser tidak dapat memproses gambar.');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outW, outH);
  ctx.drawImage(bitmap, 0, 0, outW, outH);
  bitmap.close?.();

  let quality = 0.9;
  let blob = await canvasToJpegBlob(canvas, quality);
  while (blob.size > MAX_OUTPUT_BYTES && quality > 0.5) {
    quality -= 0.08;
    blob = await canvasToJpegBlob(canvas, quality);
  }

  if (blob.size > MAX_OUTPUT_BYTES) {
    throw new Error('Gambar tetap terlalu besar setelah dikompresi. Coba foto resolusi lebih kecil.');
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Gagal membaca pratinjau gambar.'));
    reader.readAsDataURL(blob);
  });

  return { preview: dataUrl, blob, dataUrl };
};
