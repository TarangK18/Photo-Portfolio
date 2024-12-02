# Photography Portfolio

## Image Management

To add new images to the gallery:

1. Create a folder named `gallery` in the `public` directory if it doesn't exist
2. Add your images to the `public/gallery` folder
3. Name your images using the format: `category-name.jpg` (e.g., `nature-sunset.jpg`, `portrait-john.jpg`)
4. The category will be automatically extracted from the filename (everything before the first hyphen)
5. Supported image formats: jpg, jpeg, png, gif, webp

Example filenames:
- `nature-mountain-sunset.jpg` -> Category: Nature
- `portrait-wedding-couple.jpg` -> Category: Portrait
- `urban-city-night.jpg` -> Category: Urban

The gallery will automatically update with your new images without requiring any code changes.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```