# SocialTools

## Overview

SocialTools is a client-side web application that provides free online tools for social media content creators. The primary feature is an Instagram Grid Splitter that splits images into perfect grid tiles for multi-post layouts. The app runs entirely in the browser with no backend required - all image processing happens locally using Canvas APIs. Additional tools (Caption Generator, Hashtag Finder, Image Resizer) are planned but currently show "Coming Soon" placeholders.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
- **React 18** with TypeScript for type safety
- **Vite** as the build tool and dev server (configured on port 5000)
- **React Router** for client-side routing with pages for each tool

### UI Component Library
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for styling with CSS variables for theming
- **Framer Motion** for animations with mobile-optimized defaults
- **next-themes** for dark/light mode toggle

### State Management
- **React Query** (@tanstack/react-query) available for async state
- Local component state with React hooks for UI state
- Custom hooks for debouncing, mobile detection, and Object URL management

### Image Processing
- All processing happens client-side using HTML5 Canvas
- **react-image-crop** for crop/zoom/rotate functionality
- Object URLs used for efficient memory management with automatic cleanup
- Export options: JPEG, PNG Standard, PNG HD with different quality settings

### Performance Optimizations
- Heavy use of `memo()` for component memoization
- `useMemo` and `useCallback` to prevent unnecessary re-renders
- CSS transforms for GPU-accelerated animations
- Non-blocking font loading
- Object URL management to prevent memory leaks

### Project Structure
```
src/
├── components/     # Reusable UI components
│   ├── ui/        # shadcn/ui base components
│   └── *.tsx      # Feature components (ImageUploader, GridPreview, etc.)
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
└── pages/         # Route components (Home, GridSplitter, etc.)
```

### Routing
- `/` - Home page with tool selection
- `/grid-splitter` - Main image splitting tool (functional)
- `/caption-generator` - Coming soon placeholder
- `/hashtag-finder` - Coming soon placeholder
- `/image-resizer` - Coming soon placeholder

## External Dependencies

### Analytics & Monitoring
- **Vercel Analytics** (@vercel/analytics) for usage tracking

### Deployment
- Configured for Vercel deployment with SPA rewrites in `public/vercel.json`
- Google Search Console verification file present

### SEO
- **react-helmet-async** for managing document head/meta tags
- Robots.txt configured to allow all major crawlers
- OpenGraph and Twitter Card meta tags for social sharing

### Third-Party UI Libraries
- Full Radix UI primitive suite for accessible components
- Embla Carousel for carousel functionality
- Recharts available for data visualization
- Vaul for drawer components

### No Backend Dependencies
- No database integration
- No authentication system
- No server-side API calls
- All functionality runs entirely in the browser