import { API_BASE_URL } from '../constants/apiConstants';

/**
 * Formats a logo path into a full absolute URL if needed.
 * Handles cases where the backend returns a relative path (e.g. /media/...).
 */
export const getLogoUrl = (path) => {
  if (!path) return null;
  
  // If it's already an absolute URL (starts with http), return as is
  if (path.startsWith('http')) return path;
  
  // Clean up API_BASE_URL to get the root (remove /api)
  const rootUrl = API_BASE_URL.replace('/api', '');
  
  // Ensure we don't have double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${rootUrl}${cleanPath}`;
};

/**
 * Returns a consistent background color for letter avatars based on the string.
 */
export const getAvatarColor = (name) => {
  const colors = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f43f5e', // Rose
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
  ];
  
  if (!name) return colors[0];
  
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};
