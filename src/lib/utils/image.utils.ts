export const isValidImageUrl = (url: string | undefined | null): boolean => {
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

export const getCourseImageFallback = (courseName: string) => {
  // Generate a simple color based on course name
  const colors = ['from-gray-50 to-gray-20'];

  const colorIndex = courseName.length % colors.length;
  return colors[colorIndex];
};
