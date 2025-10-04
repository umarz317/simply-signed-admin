# Simply Signed Admin UI

A Next.js admin panel for managing Simply Signed learning content.

## Features

- **Stages Management**: View all learning stages
- **Categories Management**: Browse categories by stage
- **Resources Management**: View and manage:
  - Learning resources (by category)
  - Avatar customization options
  - Huggy characters
  - Prebuild avatars

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment variables in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
admin-ui/
├── app/
│   ├── stages/          # Stages listing page
│   ├── categories/      # Categories listing page
│   ├── resources/       # Resources listing page
│   ├── layout.tsx       # Root layout with navigation
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── lib/
│   └── api.ts           # API client functions
└── next.config.ts       # Next.js configuration
```

## API Integration

The admin UI connects to the Simply Signed Backend API. Make sure the backend is running on the configured `NEXT_PUBLIC_API_URL`.

### Endpoints Used:
- `GET /api/data/getAllStages`
- `GET /api/data/getStageById/:id`
- `GET /api/data/getAllDataByStageId/:stageId`
- `GET /api/data/getAllDataByCategoryId/:categoryId`
- `GET /api/data/getResourceById/:id`
- `GET /api/data/getAllAvatars`
- `GET /api/data/getAllHuggies`
- `GET /api/data/getAllPrebuildAvatars`

## Technologies

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React 19** - UI library
