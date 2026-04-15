/**
 * Utility to resolve asset URLs.
 * Handles both absolute URLs (e.g. from mock data) and relative local paths (e.g. from uploads).
 */
export const getAssetUrl = (path: string | undefined): string => {
  if (!path) return '';
  
  // If it's already a full URL, return it
  if (path.startsWith('http')) {
    return path;
  }
  
  // Ensure we don't have double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Prepend the API URL base for local uploads
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${apiBase}${cleanPath}`;
};
