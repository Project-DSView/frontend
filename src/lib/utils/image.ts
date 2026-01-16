const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;

  // Check for placeholder URLs
  const placeholderDomains = [
    'example.com',
    'placeholder.com',
    'via.placeholder.com',
    'picsum.photos',
    'unsplash.com',
  ];

  try {
    const urlObj = new URL(url);
    return !placeholderDomains.some((domain) => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
};

const transformImageUrl = (url: string | undefined | null): string => {
  if (!url) return '';

  try {
    const urlObj = new URL(url);

    // Transform MinIO URLs to use the proxy
    if (urlObj.hostname === 'minio' || urlObj.hostname === 'localhost') {
      // Extract the path after /dsview/ and use it with our proxy
      const pathMatch = urlObj.pathname.match(/\/dsview\/(.+)/);
      if (pathMatch) {
        return `/api/minio/dsview/${pathMatch[1]}`;
      }
    }

    return url;
  } catch {
    return url;
  }
};

const transformFileUrl = (url: string | undefined | null): string => {
  if (!url) return '';

  // Use the same transformation as images for MinIO URLs
  return transformImageUrl(url);
};

const getCourseImageFallback = (courseName: string) => {
  // Generate a simple color based on course name
  const colors = ['from-gray-50 to-gray-20'];

  const colorIndex = courseName.length % colors.length;
  return colors[colorIndex];
};

export { isValidImageUrl, transformImageUrl, transformFileUrl, getCourseImageFallback };
