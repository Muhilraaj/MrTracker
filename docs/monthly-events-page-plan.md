# Monthly Events Page — Implementation Plan

## Overview

Add a new authenticated page to MrTracker that displays event data for a selected month in a **tabular format**: daily tasks as rows and calendar days as columns. The page must remain usable on mobile devices via horizontal scrolling and sticky row labels.

This mirrors the shape already used in `scripts/import_may_events.py` (Excel rows = tasks, columns = day-of-month) and reuses the existing `/api/events/range` endpoint — no backend changes are required for the initial release.

---

## Goals

| Goal | Detail |
|------|--------|
| Month-at-a-glance view | See all daily tasks and their status across every day in a month |
| Tabular layout | Rows = actions (sorted by `sequence`), columns = dates (`1` … `28/29/30/31`) |
| Status visualization | Reuse status codes and colors: `10` cancelled (red), `20` pending (gray), `30` completed (green) |
| Mobile support | Readable and scrollable on narrow screens without breaking layout |
| Consistency | Match existing patterns: MUI, RTK Query, UTC date handling, JWT cookie auth |
| Optional editing | Tap/click a cell to update status (same flow as daily tracker) — can be Phase 2 |

---

## Current State

### What exists today

- **Daily tracker** at `/page/tracker/daily/form` (`DailyTrackerForm.tsx`) — card list for a single day, date picker limited to the last 7 days
- **Event API** — `GET /api/events/range?startDate=&endDate=` returns `Record<"YYYY-MM-DD", Event[]>`
- **Actions API** — `GET /api/actions?active=true` returns tasks ordered by `sequence`
- **RTK Query hooks** — `useGetEventsQuery`, `useGetActionsQuery`, `usePostEventMutation` in `frontend/src/stores/api/`
- **Status styling** — `actionStatusColorMap` in `frontend/src/constants/constants.ts`

### Gaps

- No table or grid component in the frontend
- No shared navigation between daily and monthly views (hamburger menu icon exists but is not wired)
- No responsive scroll patterns (no `useMediaQuery`, no sticky columns)
- No month/year picker (daily page uses a 7-day-limited `DatePicker`)

---

## Proposed Route & Navigation

| Item | Value |
|------|-------|
| Route | `/page/tracker/monthly/view` |
| Component | `MonthlyTrackerView.tsx` (new) |
| Registration | Add route in `frontend/src/pages/App/App.tsx` |

### Navigation updates

1. Extract a shared **AppBar** (or lightweight layout shell) used by both daily and monthly pages
2. Wire the existing `MenuIcon` to a MUI `Drawer` or `Menu` with links:
   - Daily Tracker → `/page/tracker/daily/form`
   - Monthly View → `/page/tracker/monthly/view`
3. Optionally redirect post-login to daily tracker (unchanged) — users navigate to monthly view via menu

---

## UI Design

### Desktop layout

```
┌─────────────────────────────────────────────────────────────┐
│  ☰  Monthly Tracker                              [< May 2026 >] │
├─────────────────────────────────────────────────────────────┤
│  Task                    │ 1 │ 2 │ 3 │ ... │ 30 │ 31 │     │
│──────────────────────────┼───┼───┼───┼─────┼────┼────┤     │
│  Wake Up Before 7 AM     │ ✓ │ ✓ │ · │ ... │ ✗  │ ✓  │     │
│  Workout > 15 Mins       │ · │ ✓ │ ✓ │ ... │ ✓  │ ·  │     │
│  ...                     │   │   │   │     │    │    │     │
└─────────────────────────────────────────────────────────────┘
```

- **Header row**: day numbers (`1`–`31`) with optional weekday abbreviation on wider screens (`1 Mon`)
- **First column**: action `prompt` text, sticky on horizontal scroll
- **Cells**: colored indicator or compact icon representing status (not full card layout)
- **Month selector**: MUI `DatePicker` with `views={['year', 'month']}` or prev/next chevron buttons flanking `"May 2026"`

### Mobile layout

```
┌──────────────────────────┐
│ ☰  Monthly Tracker       │
│     [< May 2026 >]       │
├──────────────────────────┤
│ Task      │ 1│ 2│ 3│ 4│ →│  ← horizontal scroll
│───────────┼──┼──┼──┼──│
│ Wake Up.. │ ✓│ ✓│ ·│ ✗│
│ Workout.. │ ·│ ✓│ ✓│ ✓│
└──────────────────────────┘
```

Mobile-specific behavior:

| Technique | Purpose |
|-----------|---------|
| `TableContainer` with `overflowX: 'auto'` | Horizontal scroll for day columns |
| Sticky first column (`position: sticky; left: 0`) | Task name stays visible while scrolling |
| Compact cell size (`minWidth: 36px`, `padding: 4px`) | Fit more days on screen |
| Abbreviated task names on xs breakpoint | Truncate with `textOverflow: 'ellipsis'` + tooltip on tap |
| Touch-friendly cell tap targets | Minimum 44×44px tap area per WCAG guidance |

### Cell rendering options

**Recommended (Phase 1 — read-only):**

- Small colored circle or filled square using `actionStatusColorMap`
- Tooltip on hover/tap: `"Completed — May 5"`

**Phase 2 (editable):**

- Tap cell → open existing `DialogWrapper` (complete / cancel / revert)
- Call `usePostEventMutation` with UTC midnight date for that column

---

## Data Flow

### 1. Month boundaries (UTC)

Follow the same UTC normalization as `DailyTrackerForm.tsx` and the backend upsert:

```typescript
const monthStart = moment.utc(selectedMonth).startOf('month');
const monthEnd   = moment.utc(selectedMonth).endOf('month');
```

Query:

```typescript
useGetEventsQuery({
  startDate: monthStart.toISOString(),
  endDate: monthEnd.toISOString(),
});
```

### 2. Build column headers

Generate an array of date keys for every day in the month:

```typescript
const daysInMonth = monthStart.daysInMonth();
const dateKeys = Array.from({ length: daysInMonth }, (_, i) =>
  monthStart.clone().add(i, 'days').format('YYYY-MM-DD')
);
```

### 3. Build row data (pivot)

For each action from `useGetActionsQuery({ active: true })`:

```typescript
const cellStatus = (actionId: string, dateKey: string): number => {
  const dayEvents = events?.[dateKey] ?? [];
  const match = dayEvents.find(e => e.actionId === actionId);
  return match?.status ?? 20; // default pending
};
```

Result shape:

```typescript
interface MonthlyRow {
  actionId: string;
  prompt: string;
  sequence: number;
  cells: Record<string, number>; // dateKey → status
}
```

### 4. No backend changes required

The existing aggregation in `EventRepositoryCustomImpl.java` already groups by `YYYY-MM-DD` (UTC). A full-month range query works as-is.

---

## Component Architecture

```
frontend/src/
├── pages/
│   └── MonthlyTracker/
│       ├── MonthlyTrackerView.tsx      # Page shell: AppBar, month picker, loading state
│       └── MonthlyEventsTable.tsx      # Table + scroll container
├── components/
│   ├── EventStatusCell.tsx             # Single cell (color dot + tooltip)
│   ├── TrackerAppBar.tsx               # Shared header with nav drawer (new, optional)
│   └── DialogWrapper.tsx               # Reuse for Phase 2 editing
├── hooks/
│   └── useMonthlyEventGrid.ts          # Pivot logic: actions × dates → grid rows
└── pages/App/App.tsx                   # Add route
```

### `useMonthlyEventGrid` hook (recommended)

Encapsulates:

- Month selection state
- RTK Query calls (`useGetActionsQuery`, `useGetEventsQuery`)
- Pivot from `Record<string, Event[]>` to `MonthlyRow[]`
- Loading / error flags

Keeps the page component focused on layout and the table component focused on rendering.

---

## MUI Table Structure

Use native MUI Table components (no `@mui/x-data-grid` dependency needed for this scope):

```tsx
<TableContainer sx={{ overflowX: 'auto', maxWidth: '100%' }}>
  <Table size="small" stickyHeader>
    <TableHead>
      <TableRow>
        <TableCell sx={{ position: 'sticky', left: 0, zIndex: 3, bgcolor: 'background.paper', minWidth: 160 }}>
          Task
        </TableCell>
        {dateKeys.map(key => (
          <TableCell key={key} align="center" sx={{ minWidth: 36, px: 0.5 }}>
            {moment.utc(key).date()}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map(row => (
        <TableRow key={row.actionId}>
          <TableCell sx={{ position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper' }}>
            {row.prompt}
          </TableCell>
          {dateKeys.map(key => (
            <TableCell key={key} align="center" sx={{ px: 0.5 }}>
              <EventStatusCell status={row.cells[key]} dateKey={key} prompt={row.prompt} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

---

## Implementation Phases

### Phase 1 — Read-only monthly table (MVP)

1. Create `MonthlyTrackerView.tsx` with AppBar, month picker, loading spinner
2. Create `useMonthlyEventGrid.ts` hook
3. Create `MonthlyEventsTable.tsx` and `EventStatusCell.tsx`
4. Register route in `App.tsx`
5. Wire navigation menu on both daily and monthly pages
6. Manual test on desktop and mobile viewport (Chrome DevTools)

**Deliverable:** User can select any month and see a color-coded grid of all active tasks.

### Phase 2 — Cell editing

1. Make `EventStatusCell` clickable
2. Reuse `DialogWrapper` + `usePostEventMutation` (same as `DailyTrackerForm`)
3. Invalidate RTK Query `Events` tag on success (already configured)
4. Show snackbar feedback via existing `snackbarSlice`

**Deliverable:** User can update event status from the monthly grid.

### Phase 3 — Polish (optional)

- Highlight today's column
- Show completion percentage row or summary bar at bottom
- Weekend column shading
- Export month to CSV
- Refactor shared AppBar into `TrackerAppBar.tsx`

---

## Files to Create / Modify

| Action | File |
|--------|------|
| **Create** | `frontend/src/pages/MonthlyTracker/MonthlyTrackerView.tsx` |
| **Create** | `frontend/src/pages/MonthlyTracker/MonthlyEventsTable.tsx` |
| **Create** | `frontend/src/components/EventStatusCell.tsx` |
| **Create** | `frontend/src/hooks/useMonthlyEventGrid.ts` |
| **Modify** | `frontend/src/pages/App/App.tsx` — add route |
| **Modify** | `frontend/src/pages/DailyTracker/DailyTrackerForm.tsx` — wire nav menu |
| **Optional create** | `frontend/src/components/TrackerAppBar.tsx` — shared header + drawer |

No backend or RTK Query API changes are required for Phase 1. Phase 2 reuses `usePostEventMutation` as-is.

---

## Mobile Testing Checklist

- [ ] Table scrolls horizontally on viewports ≤ 390px wide
- [ ] First column (task name) remains visible during scroll
- [ ] Month picker is usable on touch (MUI mobile date picker or chevron buttons)
- [ ] Cell indicators are visible at default zoom (no overlapping)
- [ ] Nav drawer opens and closes correctly on mobile
- [ ] Page loads within acceptable time for a 31-day × ~15-task grid (single API call)

---

## Performance Considerations

- **Single API call per month** — `useGetEventsQuery` fetches the entire month range in one request; RTK Query caches by params
- **Avoid re-pivoting on every render** — memoize `rows` with `useMemo` keyed on `events`, `activeActions`, and `selectedMonth`
- **Sticky column repaint** — set explicit `bgcolor` on sticky cells to prevent transparency artifacts during scroll

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Wide tables unusable on very small phones | Horizontal scroll + sticky first column; consider showing only last 7 days on xs with "Show full month" toggle if needed |
| UTC vs local timezone confusion | Continue using `moment.utc()` everywhere; document that dates align with backend UTC midnight normalization |
| Missing events show as pending | Same behavior as daily tracker (`status ?? 20`); consistent with user expectation |
| No nav between pages | Phase 1 includes wiring the hamburger menu |

---

## Success Criteria

1. Authenticated user can navigate to `/page/tracker/monthly/view`
2. Selecting a month loads and displays all active tasks in a date-column grid
3. Cell colors correctly reflect status (`10` / `20` / `30`)
4. Layout is scrollable and readable on a 375px-wide mobile viewport
5. No new backend endpoints or database changes required

---

## Reference

- Daily tracker implementation: `frontend/src/pages/DailyTracker/DailyTrackerForm.tsx`
- Event API hook: `frontend/src/stores/api/event.ts`
- Excel import shape (rows = tasks, cols = days): `scripts/import_may_events.py`
- Status constants: `frontend/src/constants/constants.ts`
