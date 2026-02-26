const downloadFile = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
    // Fallback to opening in new tab if download fails
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

const shouldDownloadFile = (fileUrl: string, mimeType?: string): boolean => {
  if (!fileUrl) return false;

  // Check by file extension
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'];
  const hasImageExtension = imageExtensions.some((ext) => fileUrl.toLowerCase().includes(ext));

  // Check by MIME type
  const isImageMimeType = Boolean(mimeType && mimeType.startsWith('image/'));

  return hasImageExtension || isImageMimeType;
};

const getFileExtension = (url: string): string => {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? `.${match[1].toLowerCase()}` : '';
};

const getSafeFilename = (url: string, providedName?: string): string => {
  if (providedName) {
    return providedName;
  }

  const extension = getFileExtension(url);
  const timestamp = Date.now();
  return `${timestamp}${extension}`;
};

export { downloadFile, shouldDownloadFile, getFileExtension, getSafeFilename };
