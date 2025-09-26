This folder contains small conservative codemods for the codebase.

convert-inline-styles.js
- Purpose: Find and convert trivial inline style usages:
  - Removes `cursor: 'pointer'` from JSX style objects and adds `cursor-pointer` to nearby `className` when safe.
  - Converts `animationDelay: 'NNNms'` to a Tailwind `delay-NNN` class for a small set of allowed delays.
- Usage:
  - Dry-run: node convert-inline-styles.js --dry-run
  - Apply:   node convert-inline-styles.js

Notes:
- The script is intentionally conservative: it only edits when `className` is a simple literal without template expressions.
- It is not perfect and should be reviewed before committing.
