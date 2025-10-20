const getDisplayFilename = (fileUrl?: string, fileName?: string): string => {
  if (fileName) {
    return fileName;
  }
  if (fileUrl) {
    // Extract filename from URL
    const urlParts = fileUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    return filename || 'ไฟล์ไม่ระบุชื่อ';
  }
  return 'ไฟล์ไม่ระบุชื่อ';
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const formatFileSizeForDisplay = (file: File): string => {
  return `${(file.size / 1024 / 1024).toFixed(1)} MB`;
};

const openFilePreview = (url: string): void => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

const downloadFileDirect = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export {
  getDisplayFilename,
  formatFileSize,
  formatFileSizeForDisplay,
  openFilePreview,
  downloadFileDirect,
};
