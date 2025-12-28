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

**Phase 1 (Data):** In progress
**Phase 2 (UI):** Not started
**Phase 3 (Logic):** Not started
**Phase 4 (Deploy):** Not started

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

### December 27, 2025 — Project created

Initial setup following Migration Flow Tool pattern.

---

*Created: December 27, 2025*
