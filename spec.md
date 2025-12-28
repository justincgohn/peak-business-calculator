# Peak Business Calculator — Specification

*Generated through iterative questioning per LLM Dev Workflow*

---

## Overview

A simple web tool that answers: "When did [business type] peak in [county]?"

User enters industry + county → sees headline stat + line graph showing the arc from 1990-2023.

**Inspiration:** Name Age Calculator ("Peak Jennifer") → "Peak Law Firms"

---

## Core Functionality

| Feature | Decision |
|---------|----------|
| **Output** | Headline stat + line graph |
| **Industry selection** | Curated dropdown (8 industries) |
| **Location selection** | Type county name with autocomplete |
| **Time range** | Full history: 1990-2023 |
| **Data source** | Census County Business Patterns |

---

## Industries (8 curated NAICS codes)

| NAICS | Industry |
|-------|----------|
| 5411 | Legal services |
| 7225 | Restaurants |
| 4481 | Clothing stores |
| 5221 | Banks (depository credit) |
| 4511 | Sporting goods stores |
| 4512 | Book stores |
| 5312 | Real estate agents |
| 8121 | Personal care services (barbers, salons) |

---

## User Flow

1. **Landing page**
   - Industry dropdown + county search box, centered
   - 3-4 featured examples below: "Try: Law firms in Philadelphia, Restaurants in San Francisco"
   - Minimal design, lots of whitespace

2. **Search interaction**
   - Select industry from dropdown
   - Type county name with autocomplete
   - Click "Find Peak" or press Enter

3. **Results display** (same page, below inputs)
   - Headline: "Law firms in Philadelphia County peaked in 2007 with 1,847 establishments. Today: 1,423 (-23%)"
   - Line chart showing 1990-2023 arc
   - Peak year marked on chart

4. **Navigation**
   - Easy to search again (inputs stay visible above results)
   - "Try another" suggestions

---

## Design Requirements

| Aspect | Decision |
|--------|----------|
| Style | Minimal/clean, matches Migration Tool |
| Typography | Same as Migration Tool |
| Colors | Neutral + subtle accent for peak year |
| Mobile | Responsive |
| Branding | "justingohn.com" in header/footer |

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Industry still growing | Show growth story: "Personal care in Austin is still growing — up 340% since 1990" |
| Sparse data (<10 establishments) | Show with "Limited data" caveat |
| No data for combo | "No data available for [industry] in [county]" |

---

## Technical Approach

| Component | Decision |
|-----------|----------|
| Frontend | Plain HTML/CSS/JS (no framework) |
| Charts | Chart.js |
| Data loading | Pre-processed JSON bundled with site |
| Hosting | GitHub Pages (standalone repo) |
| Link from | justingohn.com/builds page |

---

## Out of Scope (V1)

- ZIP code level queries
- Social sharing buttons
- Embed codes
- CSV download
- Additional industries beyond the 8 curated

---

## Success Criteria

- [ ] User can search any of ~3,100 counties
- [ ] All 8 industries queryable
- [ ] Results display with formatted numbers and chart
- [ ] Page loads in under 3 seconds
- [ ] Mobile responsive
- [ ] Data source clearly attributed

---

*Spec created: December 27, 2025*
