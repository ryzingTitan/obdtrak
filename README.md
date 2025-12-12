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

- **Framework**: Next.js 16.0.10 (App Router with Turbopack)
- **Runtime**: React 19.2.3
- **Language**: TypeScript 5.9.3
- **UI Library**: Material UI v7.3.6 (MUI)
- **Data Components**: MUI X Data Grid v8.22.0, MUI X Charts v8.22.0, MUI X Date Pickers v8.22.0
- **Styling**: Emotion (CSS-in-JS)
- **Authentication**: Auth0 v4.13.2 (`@auth0/nextjs-auth0`)
- **Data Fetching**: SWR v2.3.7 (React Hooks for Data Fetching)
- **Form Management**: Formik v2.4.9 with Yup v1.7.1 validation
- **Date/Time**: Day.js v1.11.19
- **File Uploads**: React Dropzone v14.3.8
- **Maps**: Leaflet v1.9.4 with React Leaflet v5.0.0
- **Notifications**: Notistack v3.0.2
- **Testing**: Vitest v4.0.15 + React Testing Library v16.3.0 + MSW v2.12.4
- **Code Quality**: ESLint v9 + Prettier v3.7.4

## Prerequisites

- Node.js 20.9.0+ (Node.js 24 recommended)
- npm, yarn, or pnpm
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

The Docker setup includes:

- Node.js 22 Alpine base image for minimal footprint
- Multi-stage build process (deps → builder → runner)
- Next.js configured with `output: "standalone"` for optimized builds
- Non-root user (nextjs:nodejs with UID 1001:GID 1001) for security
- Next.js telemetry disabled in production
- Supports npm, yarn, and pnpm package managers
- Application runs on port 3000 by default

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
├── proxy.ts                       # Auth0 proxy for route protection (Next.js 16)
└── theme.ts                       # MUI theme configuration
```

### File Organization

This project follows Next.js 16 App Router best practices:

- **Route-specific components** are colocated in `_components/` folders within each route (underscore prefix makes them non-routable)
- **Shared components** used across multiple routes live in the top-level `components/` directory
- **Custom hooks** are centralized in the `hooks/` directory for reusability
- **Server actions** are organized by resource type in the `lib/` directory
- **No `/src` directory** - all application code lives at the root level following Next.js conventions

## Architecture

### Authentication Flow

- Uses Auth0 (`@auth0/nextjs-auth0`) for authentication
- Proxy (`proxy.ts`) protects all routes except static assets and metadata files
  - Note: Next.js 16 renamed `middleware.ts` to `proxy.ts`
- Session management centralized in `lib/auth0.ts` with JWT token expiration checking
- JWT tokens are validated and checked for expiration with 30-second clock skew buffer
- `ensureValidSession()` helper redirects to login if session is invalid or token expired
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
  - Error handling wraps all server actions with try/catch
  - Errors logged server-side and rejected with user-friendly messages
  - Each resource (tracks, sessions, cars, records) has dedicated server action file in `lib/`
- **SWR Integration**:
  - Global configuration with 3-second refresh and revalidateOnFocus
  - Custom hooks wrap SWR logic for reusability (`useTracks`, `useSessions`, `useCars`, `useRecords`)
  - Optimistic updates implemented for create/update/delete operations
  - Uses `mutate()` for local cache updates without server revalidation
  - Conditional fetching supported (e.g., `useRecords(sessionId)` only fetches when sessionId is provided)
- **MUI DataGrid v8**:
  - Inline row editing with edit/view mode toggling
  - New rows use temporary IDs (`new-${Date.now()}`) until persisted
  - Grid state managed via `GridRowModesModel` and mode change handlers
  - Custom toolbar components for actions like "Add"
  - Action columns with Edit/Delete/Save/Cancel buttons
  - Process row update handlers for save operations
- **Error Handling**:
  - Custom `ApiError` class with status code and status text
  - Server actions catch and log errors, then reject with user-friendly messages
  - Client components handle promise rejections and display errors via Notistack snackbar
- **Form Management**:
  - Formik for form state management
  - Yup for validation schemas
  - Custom form hooks (`useAddSessionForm`, `useEditSessionForm`)
  - Date pickers use MUI X Date Pickers with Day.js adapter
  - File uploads use React Dropzone
- **Bottom Navigation**:
  - Fixed bottom navigation using MUI `BottomNavigation` component
  - Five navigation tabs: Analytics, Telemetry, Tracks, Cars, Sessions
  - Route-to-index mapping in `ROUTE_TO_INDEX` constant
  - Syncs navigation state with current pathname using `useEffect`
  - Navigation handled via Next.js `useRouter` and `usePathname` hooks

### Important Implementation Details

**New Row Pattern for MUI X Data Grid v8**:
When adding new rows to MUI X Data Grid with inline editing:

1. Generate temporary ID: `new-${Date.now()}`
2. Add to local cache with `mutate([newRow, ...(data || [])], false)`
3. Set row to edit mode with `fieldToFocus` option
4. On save, check if ID starts with `new-` to determine create vs update
5. Replace temporary row with server-created row in optimistic update

**Token Expiration Handling**:
The `isIdTokenExpired()` function includes a 30-second clock skew buffer. Tokens are considered expired if current time is within 30 seconds of expiration or beyond.

**Map Integration**:
Track preview modals use Leaflet v1.9.4 with React Leaflet v5.0.0 to display track locations on interactive maps.

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

### MUI v7 Styling

- Use `sx` prop for inline styles
- Use `styled()` from `@mui/material/styles` for reusable components
- No raw CSS files or Tailwind
- Use theme object for colors, spacing, typography
- Emotion is used as the CSS-in-JS engine
- Material UI Next.js integration via `@mui/material-nextjs` for App Router support

### Testing

- Use Vitest v4 and React Testing Library v16
- All new features require unit tests
- Prefer `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- Use `@testing-library/user-event` v14 for interactions with `await user.click(...)`
- Mock API calls with MSW v2.12.4 (Mock Service Worker)
- Mock modules with `vi.mock()` and `vi.fn()`
- All existing tests must pass after changes
- Test files use `.test.tsx` or `.test.ts` extension and are colocated with source files

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
