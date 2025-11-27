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

const openFilePreview = async (url: string, token?: string): Promise<void> => {
  // If URL requires authentication, use fetch to get blob and open it
  if (token && url.includes('/api/submissions/')) {
    try {
      // Normalize URL - use baseURL from environment
      let fullUrl = url;
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

      if (!url.startsWith('http')) {
        // Relative URL - use baseURL
        if (baseURL) {
          // Ensure baseURL doesn't have trailing slash
          const cleanBaseURL = baseURL.replace(/\/$/, '');
          fullUrl = `${cleanBaseURL}${url.startsWith('/') ? url : `/${url}`}`;
        } else {
          // Fallback to relative path (will use Next.js proxy if configured)
          fullUrl = url.startsWith('/') ? url : `/${url}`;
        }
      } else {
        // Absolute URL - keep as is but ensure it uses the correct base
        // If URL contains /go prefix, keep it (it's part of the routing)
        // Don't remove /go as it's needed for Traefik routing
      }

      // Add API key if configured
      const apiKeyName = process.env.NEXT_PUBLIC_API_KEY_NAME || 'dsview-api-key';
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;

      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
      };

      if (apiKey) {
        headers[apiKeyName] = apiKey;
      }

      console.log('Opening file preview:', {
        originalUrl: url,
        fullUrl,
        hasToken: !!token,
        hasApiKey: !!apiKey,
        tokenLength: token?.length,
      });

      let response: Response;
      try {
        response = await fetch(fullUrl, {
          headers,
          credentials: 'include',
        });
      } catch (fetchError) {
        console.error('Fetch error details:', {
          error: fetchError,
          message: fetchError instanceof Error ? fetchError.message : String(fetchError),
          url: fullUrl,
          headers,
        });
        throw new Error(
          `Network error: ${fetchError instanceof Error ? fetchError.message : 'Failed to fetch'}`,
        );
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        console.error('Response error:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText,
        });
        throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');

      // Clean up blob URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error('Error opening file preview:', error);
      throw error;
    }
  } else {
    // For public URLs, open directly
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

const downloadFileDirect = async (
  url: string,
  filename: string,
  token?: string,
  returnBlob?: boolean,
): Promise<Blob | void> => {
  // If URL requires authentication, use fetch to download
  if (token && url.includes('/api/submissions/')) {
    try {
      // Normalize URL - use baseURL from environment
      let fullUrl = url;
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

      if (!url.startsWith('http')) {
        // Relative URL - use baseURL
        if (baseURL) {
          // Ensure baseURL doesn't have trailing slash
          const cleanBaseURL = baseURL.replace(/\/$/, '');
          fullUrl = `${cleanBaseURL}${url.startsWith('/') ? url : `/${url}`}`;
        } else {
          // Fallback to relative path (will use Next.js proxy if configured)
          fullUrl = url.startsWith('/') ? url : `/${url}`;
        }
      } else {
        // Absolute URL - keep as is but ensure it uses the correct base
        // If URL contains /go prefix, keep it (it's part of the routing)
        // Don't remove /go as it's needed for Traefik routing
      }

      // Add API key if configured
      const apiKeyName = process.env.NEXT_PUBLIC_API_KEY_NAME || 'dsview-api-key';
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;

      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
      };

      if (apiKey) {
        headers[apiKeyName] = apiKey;
      }

      console.log('Downloading file:', {
        originalUrl: url,
        fullUrl,
        hasToken: !!token,
        hasApiKey: !!apiKey,
        tokenLength: token?.length,
      });

      let response: Response;
      try {
        response = await fetch(fullUrl, {
          headers,
          credentials: 'include',
        });
      } catch (fetchError) {
        console.error('Fetch error details:', {
          error: fetchError,
          message: fetchError instanceof Error ? fetchError.message : String(fetchError),
          url: fullUrl,
          headers,
        });
        throw new Error(
          `Network error: ${fetchError instanceof Error ? fetchError.message : 'Failed to fetch'}`,
        );
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        console.error('Response error:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText,
        });
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();

      // If returnBlob is true, return the blob instead of downloading
      if (returnBlob) {
        return blob;
      }

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
      throw error;
    }
  } else {
    // For public URLs, download directly
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export {
  getDisplayFilename,
  formatFileSize,
  formatFileSizeForDisplay,
  openFilePreview,
  downloadFileDirect,
};
