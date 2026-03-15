# Sheets

Google Apps Script templates for generating printable planners and calendars in Google Sheets.

## Goal

Provide ready-to-use scripts that generate structured, styled monthly layouts inside Google Sheets — both for digital use (filling in goals directly in the sheet) and for printing (hand-writing days and notes on paper).

## Setup

1. Open a Google Sheet
2. Go to **Extensions > Apps Script**
3. Paste the contents of the script file and save
4. Run the desired function from the Apps Script editor

## Scripts

### `scripts/monthly_planner.gs`

Contains two entry-point functions:

#### `createMonthlyPlanner()`

Generates a **color-coded monthly planner** for a specific month/year.

- Prompts the user for month (1-12) and year
- Creates (or overwrites) a sheet named e.g. "March 2026"
- **Calendar grid**: 2 rows per week — a compact day-number row and a taller content row for notes
- **Weekend highlighting**: Saturday/Sunday columns use a distinct background
- **Goals section**: 6 rows with interactive checkboxes and a merged text area
- Color palette: blue headers, light-blue weekdays, orange weekends, green goals

| Section        | Layout                                                                 |
|----------------|------------------------------------------------------------------------|
| Title          | Merged row spanning all 7 columns with month/year                      |
| Day headers    | Monday through Sunday                                                  |
| Calendar body  | 2 rows per week: day number (22px) + content area (96px)               |
| Goals          | Title row + 6 checkbox rows (column 1: checkbox, columns 2-7: text)    |

Key internal function:
- `buildPlanner(month, year)` — does all the sheet construction; `createMonthlyPlanner()` is the UI wrapper that collects input

#### `createBlankCalendar()`

Generates a **grayscale blank calendar** designed for printing and hand-writing.

- No prompts — runs immediately, creates a "Blank Calendar" sheet
- **6-week grid** to cover any possible month layout
- **Light grayscale palette** optimized for black-and-white printing
- Weekend columns use a slightly darker gray for visual separation
- Title row is empty (for hand-writing month/year)
- Day number rows are empty (for hand-writing day numbers)

| Section        | Layout                                                                        |
|----------------|-------------------------------------------------------------------------------|
| Title          | Empty merged row for hand-writing                                             |
| Day headers    | Monday through Sunday in gray                                                 |
| Calendar body  | 2 rows per week: empty day-number row (22px) + empty content area (96px)      |
| Goals          | Title row + 6 rows with `[  ]` checkbox + label area and description area     |

Goals rows use alternating backgrounds (`#f5f5f5` / `#fafafa`) for readability.

## Visual preview

See [SHOWCASE.md](SHOWCASE.md) for ASCII art previews of each template's output, including layout structure, color palettes, and legend.

## Sheet layout reference

Both functions share the same grid structure:

```
Row 1:        Title (merged, 7 columns)
Row 2:        Day headers (Mon-Sun)
Row 3:        Week 1 — day numbers
Row 4:        Week 1 — content
Row 5:        Week 2 — day numbers
Row 6:        Week 2 — content
...
Row N:        Goals title
Row N+1..N+6: Goal rows
```

Column width: **156px** per column. Content rows: **96px** tall. Day-number rows: **22px** tall.

## Design decisions

- **Two rows per day** (number + content): separating the day number from the writing area makes it easier to fill in notes without overwriting the date
- **Weekend colors**: distinct background helps visually scan the week structure
- **6-week blank grid**: ensures any month fits regardless of starting day
- **`sheet.clear()` + `clearFormats()` + `clearDataValidations()`**: full cleanup on re-run prevents stale formatting (especially leftover checkboxes) from previous generations
- **Grayscale for print**: the blank calendar avoids colors that look muddy when printed in black-and-white

## Contributing

When adding new templates or modifying existing ones:

- Keep each template as a self-contained function pair: a UI entry point + a builder
- Reuse the 2-row-per-week grid pattern for calendar layouts
- Test re-running on an existing sheet to verify cleanup works (no stale checkboxes, merged cells, or formatting)
- Color palettes should be defined as variables at the top of each builder function
- `sheet.getDataRange().clearDataValidations()` is a Range method, not a Sheet method — always call it on a range
