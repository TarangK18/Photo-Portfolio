# Photography Portfolio

## Image Management Guide

### Directory Structure
```
public/
├── images/           # Core website images
│   ├── hero.jpg     # Homepage hero image
│   ├── photographer.jpg  # About page profile
│   └── ...
├── carousel/        # Carousel images
│   ├── slide-1.jpg
│   ├── slide-2.jpg
│   └── ...
└── gallery/         # Main gallery images
    ├── nature-forest.jpg
    ├── portrait-wedding.jpg
    └── ...
```

### Naming Conventions

1. Gallery Images:
   - Format: `category-description.jpg`
   - Categories: nature, portrait, urban, events
   - Examples:
     * `nature-mountain-sunset.jpg`
     * `portrait-wedding-couple.jpg`
     * `urban-night-cityscape.jpg`
     * `events-concert-crowd.jpg`

2. Carousel Images:
   - Format: `slide-number.jpg`
   - Example: `slide-1.jpg`, `slide-2.jpg`

3. Core Images:
   - hero.jpg: Homepage hero image (1600x900)
   - photographer.jpg: About page profile (800x800)

### Image Requirements

1. File Formats:
   - Supported: .jpg, .jpeg, .png, .webp
   - Recommended: .jpg for photos

2. Image Sizes:
   - Gallery: 1200px on longest side
   - Carousel: 1600px width
   - Hero: 1600x900px
   - Profile: 800x800px

3. File Size:
   - Optimize all images to be under 500KB
   - Use image compression tools if needed

### Adding New Images

1. Choose the appropriate directory (gallery, carousel, or images)
2. Name the file according to conventions above
3. Optimize the image if needed
4. Place in the correct directory
5. The website will automatically update with new images

The gallery will automatically categorize images based on the prefix in their filename (everything before the first hyphen).