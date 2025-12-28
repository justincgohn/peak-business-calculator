# Peak Business Calculator

*"When did [business type] peak in [county]?" — Industry trends using Census CBP data.*

---

## Quick Reference

| Doc | Purpose |
|-----|---------|
| `spec.md` | Full requirements, design decisions, user flow |
| `data/scripts/process_cbp_data.py` | Process Census data to JSON |

---

## Status

**Phase 1 (Data):** Complete
**Phase 2 (UI):** Complete
**Phase 3 (Logic):** Complete
**Phase 4 (Deploy):** Complete

**Live URL:** https://justincgohn.github.io/peak-business-calculator/
**Repo:** https://github.com/justincgohn/peak-business-calculator

---

## Project Structure

```
Peak Business Calculator/
├── CLAUDE.md              ← This file
├── spec.md                ← Full specification
├── data/
│   ├── raw/               ← Census CBP source files
│   ├── processed/
│   │   ├── cbp_data.json
│   │   └── county_list.json
│   └── scripts/
│       └── process_cbp_data.py
└── docs/                  ← Web app (GitHub Pages serves from here)
    ├── index.html
    ├── styles.css
    ├── app.js
    └── data/
        ├── cbp_data.json
        └── county_list.json
```

---

## Data Notes

- **Source:** Census County Business Patterns (1990-2023)
- **NAICS codes:** 5411, 7225, 4481, 5221, 4511, 4512, 5312, 8121
- **Geography:** County level (~3,100 counties)

---

## Change Log

### December 27, 2025 — Bug fix: FIPS code mismatch

**Issue:** "No data available" error for valid counties like Los Angeles.

**Root cause:** county_list.json (from Migration Tool) uses underscored FIPS codes (`06_037`) but cbp_data.json uses plain FIPS (`06037`). Also, county names already include state ("Los Angeles County, CA") but display code was appending ", CA" again.

**Fix:** Added `normalizeFips()` helper to strip underscores. Fixed display to use name directly without appending state.

---

### December 27, 2025 — v1.0 Complete

- Downloaded and processed Census CBP data (2012-2023)
- Built web app with Chart.js visualization
- 8 curated industries, 3,254 counties
- Deployed to GitHub Pages
- Added to justingohn.com builds page

---

*Created: December 27, 2025*
