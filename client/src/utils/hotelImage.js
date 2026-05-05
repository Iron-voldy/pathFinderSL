const FALLBACK_HOTEL_IMAGE = '/no_img.jpg';

const PLACEHOLDER_HOSTS = new Set([
  'via.placeholder.com',
  'placehold.co',
  'placehold.it',
  'dummyimage.com',
]);

export const getHotelImageSrc = (value, fallback = FALLBACK_HOTEL_IMAGE) => {
  if (!value) return fallback;

  const rawValue = String(value).split(',')[0]?.trim();
  if (!rawValue) return fallback;

  if (/^data:image\//i.test(rawValue) || /^blob:/i.test(rawValue)) {
    return rawValue;
  }

  if (/^https?:\/\//i.test(rawValue)) {
    try {
      const parsedUrl = new URL(rawValue);
      const hostname = parsedUrl.hostname.toLowerCase();
      const placeholderText = parsedUrl.searchParams.get('text');

      if (PLACEHOLDER_HOSTS.has(hostname) || placeholderText === 'Hotel Image') {
        return fallback;
      }

      return rawValue;
    } catch {
      return fallback;
    }
  }

  if (rawValue.startsWith('/')) {
    return rawValue;
  }

  if (rawValue.startsWith('uploads/')) {
    return `/${rawValue}`;
  }

  return rawValue;
};

export const handleHotelImageError = (event, fallback = FALLBACK_HOTEL_IMAGE) => {
  const image = event.currentTarget;

  if (image.dataset.fallbackApplied === 'true') {
    image.onerror = null;
    return;
  }

  image.dataset.fallbackApplied = 'true';
  image.src = fallback;
};

export { FALLBACK_HOTEL_IMAGE };
