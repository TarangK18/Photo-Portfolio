interface ImageMetadata {
  src: string;
  alt: string;
  title: string;
  category?: string;
  description?: string;
  date?: string;
}

export function processImageFilename(filename: string): ImageMetadata {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Split by hyphens
  const parts = nameWithoutExt.split('-');
  
  // First part is category
  const category = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  
  // Rest is the title
  const title = parts.slice(1)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return {
    src: `/gallery/${filename}`,
    alt: title,
    title,
    category,
    description: `A beautiful ${category.toLowerCase()} photograph`,
    date: new Date().toISOString().split('T')[0] // Current date as fallback
  };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}