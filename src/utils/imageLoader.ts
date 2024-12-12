import { readdirSync } from 'fs';
import { join } from 'path';

export interface ImageFile {
  src: string;
  alt: string;
  category: string;
  title: string;
}

export interface CarouselImage {
  src: string;
  alt: string;
  title: string;
}

export function loadImagesFromDirectory(directory: string): ImageFile[] {
  const publicDir = 'public';
  const imagesPath = join(publicDir, directory);
  
  try {
    const files = readdirSync(imagesPath);
    return files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => {
        const [category, ...titleParts] = file.split('-');
        const title = titleParts.join(' ').replace(/\.[^/.]+$/, ''); // Remove file extension
        return {
          src: `/${directory}/${file}`,
          alt: title,
          title: title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          category: category.charAt(0).toUpperCase() + category.slice(1)
        };
      });
  } catch (error) {
    console.error('Error loading images:', error);
    return [];
  }
}

export function loadCarouselImages(): CarouselImage[] {
  const directory = 'carousel';
  const publicDir = 'public';
  const imagesPath = join(publicDir, directory);
  
  try {
    const files = readdirSync(imagesPath);
    return files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => {
        const title = file.split('-').slice(1).join(' ').replace(/\.[^/.]+$/, '');
        return {
          src: `/${directory}/${file}`,
          alt: title,
          title: title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        };
      });
  } catch (error) {
    console.error('Error loading carousel images:', error);
    return [
      {
        src: "/gallery/nature-forest.jpg",
        alt: "Nature photography",
        title: "Serene Landscapes"
      },
      {
        src: "/gallery/portrait-man.jpg",
        alt: "Portrait photography",
        title: "Captivating Portraits"
      },
      {
        src: "/gallery/urban-architecture.jpg",
        alt: "Urban photography",
        title: "Urban Stories"
      }
    ];
  }
}