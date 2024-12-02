import { readdirSync } from 'fs';
import { join } from 'path';

export interface ImageFile {
  src: string;
  alt: string;
  category: string;
}

export function loadImagesFromDirectory(directory: string): ImageFile[] {
  const publicDir = 'public';
  const imagesPath = join(publicDir, directory);
  
  try {
    const files = readdirSync(imagesPath);
    return files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => {
        const category = file.split('-')[0] || 'Uncategorized';
        return {
          src: `/${directory}/${file}`,
          alt: file.split('.')[0].replace(/-/g, ' '),
          category: category.charAt(0).toUpperCase() + category.slice(1)
        };
      });
  } catch (error) {
    console.error('Error loading images:', error);
    return [];
  }
}