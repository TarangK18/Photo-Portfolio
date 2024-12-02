import { readdirSync } from 'fs';
import { join } from 'path';
import { statSync } from 'fs';

export interface ImageFile {
  src: string;
  alt: string;
  category: string;
  timestamp: number;
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
        const filePath = join(imagesPath, file);
        const stats = statSync(filePath);
        
        return {
          src: `/Photo-Portfolio/${directory}/${file}`,
          alt: file.split('.')[0].replace(/-/g, ' '),
          category: category.charAt(0).toUpperCase() + category.slice(1),
          timestamp: stats.mtimeMs
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error loading images:', error);
    return [];
  }
}