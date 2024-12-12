# Contributing to Photography Portfolio

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── gallery/    # Gallery-specific components
│   ├── layout/     # Layout components
│   └── shared/     # Shared UI elements
├── layouts/        # Page layouts
├── pages/          # Route pages
├── styles/         # Global styles
└── utils/          # Utility functions
```

## Development Guidelines

1. Code Style
   - Use consistent indentation (2 spaces)
   - Follow ESLint and Prettier configurations
   - Write meaningful comments for complex logic

2. Component Guidelines
   - Keep components small and focused
   - Use TypeScript for type safety
   - Follow the single responsibility principle

3. Performance
   - Optimize images before adding
   - Implement lazy loading where appropriate
   - Minimize bundle size

4. Git Workflow
   - Create feature branches from main
   - Write clear commit messages
   - Submit PRs with detailed descriptions

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Build: `npm run build`

## Adding New Features

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test thoroughly
4. Submit a pull request

## Need Help?

Open an issue or contact the maintainers.