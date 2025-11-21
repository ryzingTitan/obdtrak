# AI Agent Guidelines & Project Standards

## Project Context
This project is a **Next.js** application built with **TypeScript**.
**Key Stack:**
- **Framework:** Next.js
- **UI Library:** React (Functional Components + Hooks)
- **Styling/Components:** Material UI (MUI)
- **Data Fetching:** SWR
- **Testing:** Vitest & React Testing Library
- **Linting/Formatting:** ESLint & Prettier

## Core Mandates

### 1. Strict Type Safety
- **No `any` types.** Explicitly define interfaces and types for props, state, and API responses.
- Ensure strict null checks are respected.
- Resolve all TypeScript errors before finalizing any code block.
- Avoid using `@ts-ignore` comments.

### 2. Code Quality & Formatting
- Code **must** be linted with ESLint and formatted with Prettier.
- No unused variables or imports.
- Adhere to functional programming patterns; avoid class components.

### 3. Testing Requirements
- **Zero Regression:** All existing tests must pass after modifications.
- **Coverage:** Every new feature, component, or utility function **must** include a corresponding unit test.
- **Updates:** If logic changes, update the relevant tests immediately.
- Use `Vitest` and `React Testing Library` patterns (prefer `screen` queries and user-event interactions).
- **Rendering:** Use `render` from `@testing-library/react`.
- **Selectors:** Prefer user-centric selectors in this order of priority:
    1. `getByRole` (with name option: `name: /submit/i`)
    2. `getByLabelText` (for form inputs)
    3. `getByText` (for non-interactive elements)
    4. `getByTestId` (only as a last resort).
- **User Events:** Use `@testing-library/user-event` for interactions (clicks, typing), strictly using `await user.click(...)`.
- **Mocking:** Use `vi.mock` for mocking modules and `vi.fn()` for mocking functions.

### 4. Build Integrity
- The solution is only complete when the project builds successfully (`npm run build` or equivalent).
- Verify that no new warnings are introduced in the console during build or runtime.

### 5. SWR Guidelines
- Use SWR hooks for client-side data fetching and state management where applicable.
- Create custom hooks to wrap SWR logic for reusability.
- Handle `isLoading` and `error` states explicitly in the UI.

## 5. Material UI (MUI) Guidelines
- **Styling approach:**
    - **Preferred:** Use the `sx` prop for one-off, inline styling needs.
    - **Reusable:** Use `styled()` from `@mui/material/styles` for complex, reusable components.
    - **Avoid:** Do not use raw CSS files or Tailwind classes unless specifically requested.
- **Layout:**
    - Use `<Box>` as a generic container (replacement for `div`).
    - Use `<Stack>` for one-dimensional layouts (flex column/row with gap).
    - Use `<Grid>` (Grid v2) for two-dimensional layouts.
- **Theming:** Rely on the MUI `theme` object for colors, spacing, and typography. Access it via `useTheme` or strict system props in `sx` (e.g., `sx={{ color: 'primary.main', p: 2 }}`).
- **Imports:** Import components directly to minimize bundle size, or use top-level imports if tree-shaking is configured correctly (e.g., `import { Button, Box } from '@mui/material';`).
- Ensure responsiveness using MUI's breakpoint system.

## 7. Component Structure Example

```tsx
'use client'; // Only if interactive

import { Box, Typography, Button } from '@mui/material';
import { useState } from 'react';

interface CounterProps {
  initialCount?: number;
}

export const Counter = ({ initialCount = 0 }: CounterProps) => {
  const [count, setCount] = useState(initialCount);

  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h4" gutterBottom>
        Count: {count}
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => setCount((c) => c + 1)}
      >
        Increment
      </Button>
    </Box>
  );
};

## Verification Checklist
Before marking a task as complete, verify:
- [ ] `npm run type-check` (or `tsc --noEmit`) passes.
- [ ] `npm run lint` passes with no errors.
- [ ] `npm run test` passes (all suites green).
- [ ] `npm run build` completes successfully.