const getEmbedUrl = (url: string): string => {
  // YouTube URLs
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtube.com/embed/')) {
    return url; // Already an embed URL
  }

  // Google Drive URLs
  if (url.includes('drive.google.com/file/d/')) {
    // Extract file ID from Google Drive URL
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }
  if (url.includes('drive.google.com/open')) {
    // Handle Google Drive open URLs
    const fileIdMatch = url.match(/id=([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }

  return url; // Return as-is for other video platforms
};

const isSupportedVideoPlatform = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('drive.google.com');
};

const getVideoPlatform = (url: string): string => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('drive.google.com')) {
    return 'google-drive';
  }
  return 'unknown';
};

export { getEmbedUrl, isSupportedVideoPlatform, getVideoPlatform };
