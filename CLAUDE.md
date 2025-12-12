# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OBDTrak is a track day telemetry application built with Next.js 16, React 19, TypeScript 5, and Material UI v7. The app uses Auth0 for authentication and communicates with a separate backend API to manage track day data.

The application features:

- **Analytics Dashboard**: View session telemetry data with interactive charts (temperature, boost, throttle, speed, oil pressure)
- **Telemetry Page**: Real-time telemetry data visualization
- **Track Management**: CRUD operations for race tracks with inline DataGrid editing
- **Car Management**: Manage vehicle information for tracked sessions
- **Session Management**: Create, edit, and view track day sessions with file upload support

## Technology Stack

**Core Framework & Runtime:**

- Next.js 16.0.10 (App Router with Turbopack)
- React 19.2.3
- TypeScript 5.9.3
- Node.js 20.9.0+ (Node.js 24 recommended)

**UI & Styling:**

- Material UI (MUI) v7.3.6
- MUI X Data Grid v8.22.0
- MUI X Charts v8.22.0
- MUI X Date Pickers v8.22.0
- Emotion (CSS-in-JS)
- Roboto font

**Data & State Management:**

- SWR v2.3.7 (data fetching and caching)
- Formik v2.4.9 (form management)
- Yup v1.7.1 (validation schemas)

**Authentication & API:**

- Auth0 (`@auth0/nextjs-auth0` v4.13.2)
- Custom server actions for API communication

**Utilities:**

- Day.js v1.11.19 (date manipulation)
- React Dropzone v14.3.8 (file uploads)
- Leaflet v1.9.4 & React Leaflet v5.0.0 (maps)
- Notistack v3.0.2 (notifications)

**Development & Testing:**

- Vitest v4.0.15 (test runner)
- React Testing Library v16.3.0
- MSW v2.12.4 (API mocking)
- ESLint v9 (linting)
- Prettier v3.7.4 (code formatting)

**Package Managers Supported:**

- npm (default)
- yarn
- pnpm

## Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Testing
npm test                 # Run tests with Vitest
npm run test             # Same as above

# Linting & Type Checking
npm run lint             # Run ESLint
npx tsc --noEmit        # Type check (no dedicated script)

# Formatting
npm run format           # Format code with Prettier
npm run format:check     # Check if code is formatted

# Building
npm run build            # Production build with Turbopack
npm start                # Start production server

# Docker
docker build -t obdtrak .
docker run -p 3000:3000 obdtrak
```

## Architecture Overview

### Authentication Flow

- Uses Auth0 (`@auth0/nextjs-auth0`) for authentication
- Proxy (`proxy.ts`) protects all routes except static assets and metadata files (Next.js 16 renamed middleware.ts to proxy.ts)
- Session management is centralized in `lib/auth0.ts` with JWT token expiration checking
- `ensureValidSession()` helper redirects to login if session is invalid or token expired

### API Communication Pattern

- **Server Actions**: All API calls are server actions marked with `"use server"`
- **Client-Server Boundary**:
  - Client components (`"use client"`) call server actions from `lib/` directory
  - Server actions use `fetchWithAuth()` to make authenticated requests to external API
  - External API base URL configured via `API_BASE_URL` environment variable
- **Authentication**: All API requests include Bearer token from Auth0 session

### Data Flow Architecture

```
Client Component (React)
  → Custom Hook (useTracks.ts / useSessions.ts / useCars.ts / useRecords.ts)
    → SWR for caching/revalidation
      → Server Action (lib/tracks.ts / lib/sessions.ts / lib/cars.ts / lib/records.ts)
        → fetchWithAuth (lib/api.ts)
          → External Backend API
```

Example flow for displaying analytics:

```
Analytics Page (app/analytics/page.tsx)
  → useSessions() hook to fetch session list
  → useRecords(sessionId) hook to fetch telemetry data
    → SWR caches and revalidates data
      → Server actions make authenticated API calls
        → fetchWithAuth adds Bearer token from Auth0 session
          → Backend API returns data
```

### Key Patterns

**SWR Integration**:

- Configured globally in `app/layout.tsx` with 3-second refresh and revalidateOnFocus
- Custom hooks wrap SWR logic for reusability (see `hooks/useTracks.ts`, `hooks/useSessions.ts`, `hooks/useCars.ts`, `hooks/useRecords.ts`)
- Optimistic updates implemented for create/update/delete operations
- Uses `mutate()` for local cache updates without server revalidation
- Conditional fetching supported (e.g., `useRecords(sessionId)` only fetches when sessionId is provided)

**MUI X Data Grid v8 Pattern** (see `app/tracks/_components/TracksDataGrid.tsx`, `app/cars/_components/CarsDataGrid.tsx`, `app/sessions/_components/SessionsDataGrid.tsx`):

- Inline row editing with edit/view mode toggling
- New rows use temporary IDs (`new-${Date.now()}`) until persisted
- Grid state managed via `GridRowModesModel` and mode change handlers
- Custom toolbar components for actions like "Add"
- Action columns with Edit/Delete/Save/Cancel buttons
- Process row update handlers for save operations

**Server Actions Structure**:

- Error handling wraps all server actions with try/catch
- Errors logged server-side and rejected with user-friendly messages
- Each resource (tracks, sessions, cars, records) has dedicated server action file in `lib/`

**Bottom Navigation Pattern** (see `components/Footer/Footer.tsx`):

- Fixed bottom navigation using MUI `BottomNavigation` component
- Five navigation tabs: Analytics, Telemetry, Tracks, Cars, Sessions
- Route-to-index mapping in `ROUTE_TO_INDEX` constant
- Syncs navigation state with current pathname using `useEffect`
- Navigation handled via Next.js `useRouter` and `usePathname` hooks
- When adding new routes, update: `ROUTE_TO_INDEX` mapping, `handleChange` switch statement, and `BottomNavigationAction` components

## Directory Structure

```
app/                    # Next.js App Router pages
  layout.tsx           # Root layout with MUI theme, SWR config, Header/Footer
  page.tsx             # Home page (redirects to /analytics)
  analytics/
    page.tsx           # Analytics dashboard with charts (client component)
    _components/       # Analytics-specific components (charts, tabs, selectors)
  telemetry/
    page.tsx           # Telemetry page (client component)
  tracks/
    page.tsx           # Tracks management page
    _components/       # Tracks-specific components
      TracksDataGrid.tsx    # Inline editing DataGrid for tracks
      TrackPreviewModal.tsx # Modal for previewing track details
  cars/
    page.tsx           # Car management page
    _components/       # Cars-specific components
      CarsDataGrid.tsx      # Inline editing DataGrid for cars
  sessions/
    page.tsx           # Session management page
    _components/       # Sessions-specific components
      SessionsDataGrid.tsx   # Inline editing DataGrid for sessions
      AddSessionModal.tsx    # Modal for creating new sessions
      EditSessionModal.tsx   # Modal for editing existing sessions

components/            # Shared React components (used across multiple routes)
  Header/
    Header.tsx         # App header with logo and user menu
  Footer/
    Footer.tsx         # Bottom navigation bar (5 tabs)
  Providers/
    Providers.tsx      # SWR and Notistack providers wrapper

hooks/                 # Custom React hooks
  useTracks.ts         # SWR-based hook for track CRUD operations
  useSessions.ts       # SWR-based hook for session CRUD operations
  useCars.ts           # SWR-based hook for car CRUD operations
  useRecords.ts        # SWR-based hook for fetching telemetry records
  useAddSessionForm.ts # Form state management for adding sessions
  useEditSessionForm.ts # Form state management for editing sessions

lib/                   # Server-side utilities and actions
  api.ts               # Generic fetchWithAuth for authenticated API calls
  api-error.ts         # Custom error class for API errors
  auth0.ts             # Auth0 client and session helpers
  tracks.ts            # Server actions for track CRUD operations
  sessions.ts          # Server actions for session CRUD operations
  cars.ts              # Server actions for car CRUD operations
  records.ts           # Server actions for fetching telemetry records

types/                 # TypeScript type definitions
  api.ts               # API response types (Track, Session, Car, Record interfaces)
  validations.ts       # Validation schemas

proxy.ts               # Auth0 proxy for route protection (Next.js 16)
theme.ts               # MUI theme configuration
```

## Environment Variables

Required in `.env.local`:

- `AUTH0_SECRET` - Auth0 secret key
- `AUTH0_BASE_URL` - Application base URL (e.g., http://localhost:3000)
- `AUTH0_ISSUER_BASE_URL` - Auth0 tenant URL
- `AUTH0_CLIENT_ID` - Auth0 application client ID
- `AUTH0_CLIENT_SECRET` - Auth0 application client secret
- `API_BASE_URL` - Backend API base URL (e.g., http://localhost:3001/api)

## Code Standards (from AGENTS.md)

**Code Formatting**:

- Use Prettier for all code formatting
- Run `npm run format` before committing changes
- Prettier handles formatting for TypeScript, JavaScript, JSON, Markdown, and YAML files
- Do not manually format code - let Prettier handle all formatting decisions

**Type Safety**:

- No `any` types - all props, state, and API responses must be typed
- No `@ts-ignore` comments
- Resolve all TypeScript errors before completion

**Testing Requirements**:

- Use Vitest v4 and React Testing Library v16
- All new features require unit tests
- Prefer `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- Use `@testing-library/user-event` v14 for interactions with `await user.click(...)`
- Mock API calls with MSW v2.12.4 (Mock Service Worker)
- Mock modules with `vi.mock()` and `vi.fn()`
- All existing tests must pass after changes
- Test files use `.test.tsx` or `.test.ts` extension and are colocated with source files

**MUI v7 Styling**:

- Use `sx` prop for inline styles
- Use `styled()` from `@mui/material/styles` for reusable components
- No raw CSS files or Tailwind
- Use theme object for colors, spacing, typography
- Emotion is used as the CSS-in-JS engine
- Material UI Next.js integration via `@mui/material-nextjs` for App Router support

**Component Patterns**:

- Functional components only
- Use `"use client"` directive only when necessary (state, events, browser APIs)
- Server components by default for better performance

## Important Implementation Details

**New Row Pattern for MUI X Data Grid v8**:
When adding new rows to MUI X Data Grid with inline editing:

1. Generate temporary ID: `new-${Date.now()}`
2. Add to local cache with `mutate([newRow, ...(data || [])], false)`
3. Set row to edit mode with `fieldToFocus` option
4. On save, check if ID starts with `new-` to determine create vs update
5. Replace temporary row with server-created row in optimistic update

**Token Expiration Handling**:
The `isIdTokenExpired()` function includes a 30-second clock skew buffer. Tokens are considered expired if current time is within 30 seconds of expiration or beyond.

**Error Boundaries**:
API errors use custom `ApiError` class with status code and status text. Server actions catch and log errors, then reject with user-friendly messages. Client components should handle promise rejections and display errors via Notistack snackbar.

**Docker & Deployment**:

- Next.js configured with `output: "standalone"` in `next.config.ts` for optimized Docker builds
- Dockerfile uses Node.js 22 Alpine base image
- Multi-stage build process: deps → builder → runner
- Production image uses non-root user (nextjs:nodejs with UID 1001:GID 1001)
- Next.js telemetry disabled in production
- Supports npm, yarn, and pnpm package managers in Docker builds
- Application runs on port 3000 by default

**Form Management**:

- Formik v2.4.9 for form state management
- Yup v1.7.1 for validation schemas
- See `hooks/useAddSessionForm.ts` and `hooks/useEditSessionForm.ts` for custom form hooks
- Date pickers use MUI X Date Pickers v8 with Day.js adapter
- File uploads use React Dropzone v14.3.8

**Map Integration**:

- Leaflet v1.9.4 for map rendering
- React Leaflet v5.0.0 for React bindings
- Used in track preview modals to display track locations
