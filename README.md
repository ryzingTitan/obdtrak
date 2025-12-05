# OBDTrak

A track day telemetry application for recording, analyzing, and managing motorsport session data.

## Features

- **Session Management**: Create, edit, and view track day sessions
- **Analytics Dashboard**: View detailed analytics for each session including temperature, boost, throttle, speed, and oil pressure charts
- **Telemetry**: Real-time telemetry data visualization and analysis
- **Track Management**: Manage track information with inline editing
- **Car Management**: Manage vehicle information for tracked sessions
- **Secure Authentication**: Auth0-based authentication with JWT tokens
- **Real-time Updates**: SWR-based data fetching with automatic revalidation
- **Responsive Design**: Material UI components with mobile-friendly bottom navigation

## Tech Stack

- **Framework**: Next.js 15 (App Router with Turbopack)
- **Language**: TypeScript
- **UI Library**: Material UI (MUI)
- **Authentication**: Auth0 (`@auth0/nextjs-auth0`)
- **Data Fetching**: SWR (React Hooks for Data Fetching)
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier

## Prerequisites

- Node.js 18+
- npm or yarn
- Auth0 account for authentication setup
- Backend API server running (see API_BASE_URL configuration)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd obdtrak
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Auth0 Configuration
AUTH0_SECRET=<your-auth0-secret>
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=<your-auth0-tenant-url>
AUTH0_CLIENT_ID=<your-auth0-client-id>
AUTH0_CLIENT_SECRET=<your-auth0-client-secret>

# API Configuration
API_BASE_URL=http://localhost:3001/api
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

### Development

```bash
npm run dev              # Start dev server with Turbopack
```

### Testing

```bash
npm test                 # Run tests with Vitest
npm run test             # Same as above
```

### Linting & Formatting

```bash
npm run lint             # Run ESLint
npx tsc --noEmit        # Type check
npm run format           # Format code with Prettier
npm run format:check     # Check if code is formatted
```

### Building

```bash
npm run build            # Production build with Turbopack
npm start                # Start production server
```

### Docker

```bash
docker build -t obdtrak .
docker run -p 3000:3000 obdtrak
```

## Project Structure

```
obdtrak/
├── app/                           # Next.js App Router pages
│   ├── layout.tsx                # Root layout with MUI theme, SWR config
│   ├── page.tsx                  # Home page (redirects to /analytics)
│   ├── analytics/                # Analytics dashboard
│   │   ├── page.tsx             # Analytics page
│   │   └── _components/         # Analytics-specific components
│   │       ├── AnalyticsTabs.tsx
│   │       ├── SessionSelector.tsx
│   │       ├── SummaryTab.tsx
│   │       ├── BoostChart.tsx
│   │       ├── OilPressureChart.tsx
│   │       ├── SpeedChart.tsx
│   │       ├── TemperatureChart.tsx
│   │       └── ThrottleChart.tsx
│   ├── telemetry/                # Telemetry visualization
│   │   └── page.tsx
│   ├── tracks/                   # Track management
│   │   ├── page.tsx
│   │   └── _components/
│   │       ├── TracksDataGrid.tsx
│   │       └── TrackPreviewModal.tsx
│   ├── cars/                     # Car management
│   │   ├── page.tsx
│   │   └── _components/
│   │       └── CarsDataGrid.tsx
│   └── sessions/                 # Session management
│       ├── page.tsx
│       └── _components/
│           ├── SessionsDataGrid.tsx
│           ├── AddSessionModal.tsx
│           └── EditSessionModal.tsx
├── components/                    # Shared components (used across routes)
│   ├── Header/
│   │   └── Header.tsx            # App header with user menu
│   ├── Footer/
│   │   └── Footer.tsx            # Bottom navigation bar
│   └── Providers/
│       └── Providers.tsx         # SWR and Notistack providers
├── hooks/                         # Custom React hooks
│   ├── useTracks.ts              # SWR-based hook for track CRUD
│   ├── useSessions.ts            # SWR-based hook for session CRUD
│   ├── useCars.ts                # SWR-based hook for car CRUD
│   ├── useRecords.ts             # SWR-based hook for telemetry records
│   ├── useAddSessionForm.ts      # Form state for adding sessions
│   └── useEditSessionForm.ts     # Form state for editing sessions
├── lib/                           # Server-side utilities and actions
│   ├── api.ts                    # Generic fetchWithAuth for API calls
│   ├── api-error.ts              # Custom error class for API errors
│   ├── auth0.ts                  # Auth0 client and session helpers
│   ├── tracks.ts                 # Server actions for track CRUD
│   ├── sessions.ts               # Server actions for session CRUD
│   ├── cars.ts                   # Server actions for car CRUD
│   └── records.ts                # Server actions for telemetry records
├── types/                         # TypeScript type definitions
│   ├── api.ts                    # API response types (Track, Session, Car, Record)
│   └── validations.ts            # Validation schemas
├── middleware.ts                  # Auth0 middleware for route protection
└── theme.ts                       # MUI theme configuration
```

### File Organization

This project follows Next.js 15 App Router best practices:

- **Route-specific components** are colocated in `_components/` folders within each route (underscore prefix makes them non-routable)
- **Shared components** used across multiple routes live in the top-level `components/` directory
- **Custom hooks** are centralized in the `hooks/` directory for reusability
- **Server actions** are organized by resource type in the `lib/` directory
- **No `/src` directory** - all application code lives at the root level following Next.js conventions

## Architecture

### Authentication Flow

- All routes are protected by Auth0 middleware except static assets
- JWT tokens are validated and checked for expiration (30-second buffer)
- Invalid or expired sessions redirect to Auth0 login

### Data Flow

```
Client Component (React)
  → Custom Hook (e.g., useTracks.ts)
    → SWR (caching/revalidation)
      → Server Action (lib/tracks.ts)
        → fetchWithAuth (lib/api.ts)
          → External Backend API
```

### Key Patterns

- **Server Actions**: All API calls are server actions marked with `"use server"`
- **SWR Integration**: Global configuration with 3-second refresh and revalidateOnFocus
- **Optimistic Updates**: Immediate UI updates with background revalidation
- **MUI DataGrid**: Inline row editing with temporary IDs for new rows
- **Error Handling**: Custom ApiError class with user-friendly messages

## Development Guidelines

### Code Standards

- Use Prettier for all formatting (run `npm run format` before commits)
- No `any` types - all code must be fully typed
- No `@ts-ignore` comments allowed
- All tests must pass before completion

### Component Patterns

- Functional components only
- Use `"use client"` directive only when necessary (state, events, browser APIs)
- Server components by default for better performance
- Use MUI's `sx` prop for inline styles
- Use `styled()` for reusable components

### Testing

- Use Vitest and React Testing Library
- All new features require unit tests
- Prefer `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- Use `@testing-library/user-event` for interactions
- Mock with `vi.mock()` and `vi.fn()`

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests: `npm test`
4. Format code: `npm run format`
5. Run linter: `npm run lint`
6. Type check: `npx tsc --noEmit`
7. Commit and push your changes
8. Create a pull request

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions, please open an issue in the repository.
