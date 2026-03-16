# CLAUDE.md

## Project overview

Google Apps Script project generating monthly planner and calendar templates in Google Sheets. Scripts are in `scripts/` and run inside the Apps Script editor (Extensions > Apps Script).

## File map

- `scripts/monthly_planner.gs` — monthly planner template
  - `createMonthlyPlanner()` — entry point: prompts for month/year, calls `buildPlanner()`
  - `buildPlanner(month, year)` — builds a color-coded monthly planner with goals section
  - Content cells contain live formulas referencing a **"Payments"** sheet (columns: id, label, due_date, payment_date, value, payment_value). If the sheet doesn't exist, cells show empty via IFERROR.
- `scripts/blank_calendar.gs` — blank printable calendar template
  - `createBlankCalendar()` — builds a grayscale blank calendar for printing (no prompts)
- `SHOWCASE.md` — ASCII art previews of each template's output with color palettes and legends

## Architecture patterns

- Each template has an **entry-point function** (handles UI/prompts) and a **builder function** (constructs the sheet)
- Calendar grid uses **2 rows per week**: a short day-number row (22px) + a taller content row (96px for planner, 72px for blank calendar — reduced to fit A4 landscape)
- Color palettes are defined as local variables at the top of each builder
- Column width: 156px across all 7 day columns

## Important gotchas

- `clearDataValidations()` is a **Range method**, not a Sheet method — use `sheet.getDataRange().clearDataValidations()`
- `sheet.clear()` alone does NOT remove checkboxes — must also call `clearFormats()` and `clearDataValidations()` on re-run
- Day-of-week conversion: JS `getDay()` returns 0=Sunday; code converts to Monday=0 with `(getDay() + 6) % 7`
- The blank calendar uses 6 weeks (fixed) to cover any month; the planner calculates exact weeks needed

## Keeping SHOWCASE.md up to date

When a template's layout, color palette, grid structure, or goals section changes, update `SHOWCASE.md` to match. Each template has its own ASCII art block — edit only the affected block. Ensure:
- ASCII art rows stay 92 chars wide
- Weekend border characters (`:` for planner, `.` for blank calendar) are preserved
- Color palette tables reflect the actual hex values in the code
- Legends match the symbols used in the art

## Testing

No automated tests. To verify changes:
1. Paste the script into a Google Sheet's Apps Script editor
2. Run each entry-point function
3. Check: correct day placement, weekend colors, goals section positioning, and re-run cleanup (no leftover checkboxes or formatting)
