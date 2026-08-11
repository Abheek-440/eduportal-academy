import { API_BASE_URL } from "../config/apiConfig";

export const DEFAULT_COURSE_IMAGE = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80";

/**
 * Returns a fully qualified, safe URL for course images.
 * Handles Cloudinary/external URLs, Base64 strings, blob previews, and relative local upload filenames.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string" || imagePath.trim() === "") {
    return DEFAULT_COURSE_IMAGE;
  }

  const trimmed = imagePath.trim();

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  // Remove any leading slashes or 'uploads/' prefix if present
  const cleanFilename = trimmed.replace(/^\/?(uploads\/)?/, "");

  return `${API_BASE_URL}/uploads/${encodeURIComponent(cleanFilename)}`;
};

/**
 * Image onError handler to fallback to a default image when loading fails.
 */
export const handleImageError = (e) => {
  if (e.target && e.target.src !== DEFAULT_COURSE_IMAGE) {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = DEFAULT_COURSE_IMAGE;
  }
};
