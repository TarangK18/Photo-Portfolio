// Image directory constants
export const DIRECTORIES = {
  GALLERY: 'gallery',
  CAROUSEL: 'carousel',
  IMAGES: 'images'
} as const;

// Image categories
export const CATEGORIES = [
  'Nature',
  'Portrait',
  'Urban',
  'Events'
] as const;

// Responsive breakpoints for gallery
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1280
} as const;

// Gallery configuration
export const GALLERY_CONFIG = {
  THUMBNAIL_WIDTH: 300,
  GAP: 16,
  BORDER_RADIUS: 12,
  COLUMNS: {
    MOBILE: 2,
    TABLET: 3,
    DESKTOP: 5,
    WIDE: 6
  }
} as const;