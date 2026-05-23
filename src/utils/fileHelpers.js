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

/** @param {(string|Blob|File)[]} photos @returns {Blob[]} */
export const photosToUploadBlobs = (photos = []) =>
  photos
    .map((photo, index) => {
      if (photo instanceof Blob) return photo;
      if (typeof photo === 'string' && photo.startsWith('data:')) {
        return dataUrlToBlob(photo) || null;
      }
      return null;
    })
    .filter(Boolean);
