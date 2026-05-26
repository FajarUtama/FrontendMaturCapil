/** @param {string} dataUrl @returns {Blob|null} */
export const dataUrlToBlob = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null;
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
};

/**
 * @param {Array<string|Blob|File|{ blob?: Blob, dataUrl?: string }>} photos
 * @returns {Blob[]}
 */
export const photosToUploadBlobs = (photos = []) =>
  photos
    .map((photo) => {
      if (photo?.blob instanceof Blob) return photo.blob;
      if (photo instanceof Blob) return photo;
      if (typeof photo === 'string' && photo.startsWith('data:')) {
        return dataUrlToBlob(photo);
      }
      if (photo?.dataUrl?.startsWith?.('data:')) {
        return dataUrlToBlob(photo.dataUrl);
      }
      return null;
    })
    .filter(Boolean);

/** Untuk mock / fallback yang masih pakai data URL */
export const photosToDataUrls = (photos = []) =>
  photos
    .map((photo) => {
      if (typeof photo === 'string' && photo.startsWith('data:')) return photo;
      if (photo?.dataUrl?.startsWith?.('data:')) return photo.dataUrl;
      if (photo?.preview?.startsWith?.('data:')) return photo.preview;
      return null;
    })
    .filter(Boolean);
