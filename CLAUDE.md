# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OBDTrak is a track day telemetry application built with Next.js 15, TypeScript, and Material UI. The app uses Auth0 for authentication and communicates with a separate backend API to manage track day data.

The application features:

- **Analytics Dashboard**: View session telemetry data with interactive charts (temperature, boost, throttle, speed, oil pressure)
- **Telemetry Page**: Real-time telemetry data visualization
- **Track Management**: CRUD operations for race tracks with inline DataGrid editing
- **Car Management**: Manage vehicle information for tracked sessions
- **Session Management**: Create, edit, and view track day sessions with file upload support

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
- Middleware (`middleware.ts`) protects all routes except static assets and metadata files
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

**MUI DataGrid Pattern** (see `components/TracksDataGrid.tsx`, `components/CarsDataGrid.tsx`, `components/SessionsDataGrid.tsx`):

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
    _components/       # Analytics-specific components
  telemetry/
    page.tsx           # Telemetry page (client component)
  tracks/
    page.tsx           # Tracks management page
    _components/       # Tracks-specific components (TracksDataGrid)
  cars/
    page.tsx           # Car management page
  sessions/
    page.tsx           # Session management page

components/            # Shared React components
  Header/
    Header.tsx         # App header with logo and user menu
  Footer/
    Footer.tsx         # Bottom navigation bar (5 tabs)
  AddSessionModal.tsx
  EditSessionModal.tsx
  CarsDataGrid.tsx
  SessionsDataGrid.tsx
  TrackPreviewModal.tsx

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

middleware.ts          # Auth0 middleware for route protection
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

- Use Vitest and React Testing Library
- All new features require unit tests
- Prefer `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- Use `@testing-library/user-event` for interactions with `await user.click(...)`
- Mock with `vi.mock()` and `vi.fn()`
- All existing tests must pass after changes

**MUI Styling**:

- Use `sx` prop for inline styles
- Use `styled()` from `@mui/material/styles` for reusable components
- No raw CSS files or Tailwind
- Use theme object for colors, spacing, typography

**Component Patterns**:

- Functional components only
- Use `"use client"` directive only when necessary (state, events, browser APIs)
- Server components by default for better performance

## Important Implementation Details

**New Row Pattern for DataGrid**:
When adding new rows to MUI DataGrid with inline editing:

1. Generate temporary ID: `new-${Date.now()}`
2. Add to local cache with `mutate([newRow, ...(data || [])], false)`
3. Set row to edit mode with `fieldToFocus` option
4. On save, check if ID starts with `new-` to determine create vs update
5. Replace temporary row with server-created row in optimistic update

**Token Expiration Handling**:
The `isIdTokenExpired()` function includes a 30-second clock skew buffer. Tokens are considered expired if current time is within 30 seconds of expiration or beyond.

**Error Boundaries**:
API errors use custom `ApiError` class with status code and status text. Server actions catch and log errors, then reject with user-friendly messages. Client components should handle promise rejections and display errors via Notistack snackbar.
