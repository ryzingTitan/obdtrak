# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OBDTrak is a track day telemetry application built with Next.js 15, TypeScript, and Material UI. The app uses Auth0 for authentication and communicates with a separate backend API to manage track data.

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
  → Custom Hook (useTracks.ts)
    → SWR for caching/revalidation
      → Server Action (lib/tracks.ts)
        → fetchWithAuth (lib/api.ts)
          → External Backend API
```

### Key Patterns

**SWR Integration**:

- Configured globally in `app/layout.tsx` with 3-second refresh and revalidateOnFocus
- Custom hooks wrap SWR logic for reusability (see `hooks/useTracks.ts`)
- Optimistic updates implemented for create/update/delete operations
- Uses `mutate()` for local cache updates without server revalidation

**MUI DataGrid Pattern** (see `app/tracks/page.tsx`):

- Inline row editing with edit/view mode toggling
- New rows use temporary IDs (`new-${Date.now()}`) until persisted
- Grid state managed via `GridRowModesModel` and mode change handlers
- Custom toolbar component for actions like "Add"

**Server Actions Structure**:

- Error handling wraps all server actions with try/catch
- Errors logged server-side and rejected with user-friendly messages
- Each resource (tracks, etc.) has dedicated server action file in `lib/`

## Directory Structure

```
app/                    # Next.js App Router pages
  layout.tsx           # Root layout with MUI theme, SWR config, Header/Footer
  page.tsx             # Home page
  tracks/
    page.tsx           # Tracks management page (client component)

components/            # Shared React components
  Header.tsx
  Footer.tsx

hooks/                 # Custom React hooks
  useTracks.ts         # SWR-based hook for track CRUD operations

lib/                   # Server-side utilities and actions
  api.ts               # Generic fetchWithAuth for authenticated API calls
  api-error.ts         # Custom error class for API errors
  auth0.ts             # Auth0 client and session helpers
  tracks.ts            # Server actions for track CRUD operations

types/                 # TypeScript type definitions
  api.ts               # API response types (Track interface)

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
