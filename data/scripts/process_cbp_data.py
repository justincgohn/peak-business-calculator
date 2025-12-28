#!/usr/bin/env python3
"""
Download and process Census County Business Patterns data.

Downloads establishment counts for 8 industry types across all US counties
from 1998-2023, then processes into a JSON file for the Peak Business Calculator.

Usage: python process_cbp_data.py
"""

import json
import urllib.request
import urllib.error
import time
from pathlib import Path
from collections import defaultdict

# Project paths
SCRIPT_DIR = Path(__file__).parent
RAW_DIR = SCRIPT_DIR.parent / "raw"
PROCESSED_DIR = SCRIPT_DIR.parent / "processed"

# NAICS codes for 8 curated industries
NAICS_CODES = {
    "5411": "Legal services",
    "7225": "Restaurants",
    "4481": "Clothing stores",
    "5221": "Banks",
    "4511": "Sporting goods stores",
    "4512": "Book stores",
    "5312": "Real estate agents",
    "8121": "Personal care services"
}

# NAICS variable names by year range
# Census uses different NAICS versions over time
NAICS_VAR_BY_YEAR = {
    range(1998, 2003): "NAICS1997",
    range(2003, 2008): "NAICS2002",
    range(2008, 2012): "NAICS2007",
    range(2012, 2017): "NAICS2012",
    range(2017, 2022): "NAICS2017",
    range(2022, 2030): "NAICS2017",  # 2022-2023 still uses 2017
}

def get_naics_var(year):
    """Get the correct NAICS variable name for a given year."""
    for year_range, var_name in NAICS_VAR_BY_YEAR.items():
        if year in year_range:
            return var_name
    return "NAICS2017"  # fallback

def fetch_cbp_data(year, naics_code):
    """
    Fetch CBP data from Census API for a specific year and NAICS code.
    Returns list of (fips, name, establishments) tuples.
    """
    naics_var = get_naics_var(year)

    # Build API URL
    url = f"https://api.census.gov/data/{year}/cbp?get=ESTAB,NAME&for=county:*&{naics_var}={naics_code}"

    try:
        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'PeakBusinessCalculator/1.0')

        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))

        # First row is headers, rest is data
        # Format: [ESTAB, NAME, NAICS, state, county]
        results = []
        for row in data[1:]:
            estab = row[0]
            name = row[1]
            # row[2] is NAICS code (skip it)
            state_fips = row[3]
            county_fips = row[4]

            # Skip if no establishment data
            if estab is None or estab == "":
                continue

            # Create 5-digit FIPS
            fips = f"{state_fips}{county_fips}"

            try:
                estab_count = int(estab)
                results.append((fips, name, estab_count))
            except (ValueError, TypeError):
                continue

        return results

    except urllib.error.URLError as e:
        print(f"  Error fetching {year} / {naics_code}: {e}")
        return []
    except json.JSONDecodeError as e:
        print(f"  JSON error for {year} / {naics_code}: {e}")
        return []

def download_all_data():
    """Download all CBP data and save raw results."""
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    # Store all data: {year: {naics: [(fips, name, estab), ...]}}
    all_data = {}

    years = list(range(2012, 2024))  # 2012-2023 (NAICS2012+ API works reliably)

    for year in years:
        print(f"\nDownloading {year}...")
        all_data[year] = {}

        for naics_code in NAICS_CODES:
            print(f"  NAICS {naics_code} ({NAICS_CODES[naics_code]})...", end=" ")
            results = fetch_cbp_data(year, naics_code)
            all_data[year][naics_code] = results
            print(f"{len(results)} counties")

            # Be nice to the API
            time.sleep(0.5)

    # Save raw data
    raw_file = RAW_DIR / "cbp_raw_data.json"

    # Convert tuples to lists for JSON serialization
    serializable = {}
    for year, naics_data in all_data.items():
        serializable[str(year)] = {}
        for naics, counties in naics_data.items():
            serializable[str(year)][naics] = [list(c) for c in counties]

    with open(raw_file, 'w') as f:
        json.dump(serializable, f)

    print(f"\nRaw data saved to {raw_file}")
    return all_data

def process_data(all_data):
    """
    Process raw data into final JSON structure.

    Output format:
    {
        "42101": {
            "name": "Philadelphia County, PA",
            "5411": {"1998": 1234, "1999": 1256, ...},
            "7225": {"1998": 567, ...},
            ...
        },
        ...
    }
    """
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    # Build county data structure
    counties = defaultdict(lambda: {"name": "", "data": defaultdict(dict)})

    for year, naics_data in all_data.items():
        year_str = str(year)

        for naics_code, county_list in naics_data.items():
            for fips, name, estab in county_list:
                counties[fips]["name"] = name
                counties[fips]["data"][naics_code][year_str] = estab

    # Convert to final format
    output = {}
    for fips, county_info in counties.items():
        output[fips] = {
            "name": county_info["name"],
            **{naics: years for naics, years in county_info["data"].items()}
        }

    # Save processed data
    output_file = PROCESSED_DIR / "cbp_data.json"
    with open(output_file, 'w') as f:
        json.dump(output, f)

    print(f"Processed data saved to {output_file}")
    print(f"Total counties: {len(output)}")

    return output

def copy_county_list():
    """Copy county_list.json from Migration Tool if available."""
    migration_tool_path = Path(__file__).parent.parent.parent / "Migration Flow Tool" / "data" / "processed" / "county_list.json"

    if migration_tool_path.exists():
        import shutil
        dest = PROCESSED_DIR / "county_list.json"
        shutil.copy(migration_tool_path, dest)
        print(f"Copied county_list.json from Migration Tool")
    else:
        print("Migration Tool county_list.json not found - will need to create separately")

def main():
    print("=" * 60)
    print("Peak Business Calculator - Data Pipeline")
    print("=" * 60)

    # Step 1: Download all data
    print("\n[Step 1] Downloading CBP data from Census API...")
    all_data = download_all_data()

    # Step 2: Process into final format
    print("\n[Step 2] Processing data...")
    process_data(all_data)

    # Step 3: Copy county list
    print("\n[Step 3] Copying county list...")
    copy_county_list()

    print("\n" + "=" * 60)
    print("Done!")
    print("=" * 60)

if __name__ == "__main__":
    main()
