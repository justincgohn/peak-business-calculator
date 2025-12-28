// Peak Business Calculator - Main Application

// Industry names for display
const INDUSTRY_NAMES = {
    '5411': 'Legal services',
    '7225': 'Restaurants',
    '4481': 'Clothing stores',
    '5221': 'Banks',
    '4511': 'Sporting goods stores',
    '4512': 'Book stores',
    '5312': 'Real estate brokerage offices',
    '531320': 'Appraisal firms',
    '8121': 'Personal care services'
};

// Global data stores
let cbpData = null;
let countyList = null;
let selectedCountyFips = null;
let trendChart = null;

// Helper to normalize FIPS codes (remove underscores)
function normalizeFips(fips) {
    return fips ? fips.replace('_', '') : fips;
}

// DOM Elements
const industrySelect = document.getElementById('industry-select');
const countySearch = document.getElementById('county-search');
const autocompleteList = document.getElementById('autocomplete-list');
const searchBtn = document.getElementById('search-btn');
const resultsDiv = document.getElementById('results');
const headlineDiv = document.getElementById('headline');
const dataNoteDiv = document.getElementById('data-note');
const errorDiv = document.getElementById('error');
const exampleBtns = document.querySelectorAll('.example-btn');

// Initialize
async function init() {
    try {
        // Load data files
        const [cbpResponse, countyResponse] = await Promise.all([
            fetch('data/cbp_data.json'),
            fetch('data/county_list.json')
        ]);

        cbpData = await cbpResponse.json();
        countyList = await countyResponse.json();

        console.log(`Loaded ${Object.keys(cbpData).length} counties with CBP data`);
        console.log(`Loaded ${countyList.length} counties for autocomplete`);

        // Set up event listeners
        setupEventListeners();

    } catch (error) {
        console.error('Failed to load data:', error);
        showError('Failed to load data. Please refresh the page.');
    }
}

function setupEventListeners() {
    // County search autocomplete
    countySearch.addEventListener('input', handleCountyInput);
    countySearch.addEventListener('focus', () => {
        if (countySearch.value.length >= 2) {
            showAutocomplete(countySearch.value);
        }
    });

    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.input-group')) {
            autocompleteList.classList.remove('active');
        }
    });

    // Keyboard navigation for autocomplete
    countySearch.addEventListener('keydown', handleAutocompleteKeydown);

    // Search button
    searchBtn.addEventListener('click', handleSearch);

    // Enter key to search
    countySearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !autocompleteList.classList.contains('active')) {
            handleSearch();
        }
    });

    // Example buttons
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const industry = btn.dataset.industry;
            const county = btn.dataset.county;

            industrySelect.value = industry;
            selectedCountyFips = county;

            // Find and display county name
            const countyInfo = countyList.find(c => normalizeFips(c.fips) === county);
            if (countyInfo) {
                countySearch.value = countyInfo.name; // name already includes state
            }

            handleSearch();
        });
    });
}

function handleCountyInput(e) {
    const query = e.target.value.trim();
    selectedCountyFips = null;

    if (query.length < 2) {
        autocompleteList.classList.remove('active');
        return;
    }

    showAutocomplete(query);
}

function showAutocomplete(query) {
    const queryLower = query.toLowerCase();

    // Filter counties
    const matches = countyList
        .filter(c => {
            const fullName = `${c.name}, ${c.state}`.toLowerCase();
            return fullName.includes(queryLower);
        })
        .slice(0, 10);

    if (matches.length === 0) {
        autocompleteList.classList.remove('active');
        return;
    }

    // Build autocomplete HTML (name already includes state)
    autocompleteList.innerHTML = matches.map((c, i) => `
        <div class="autocomplete-item" data-fips="${normalizeFips(c.fips)}" data-index="${i}">
            <span class="county-name">${c.name}</span>
        </div>
    `).join('');

    // Add click handlers
    autocompleteList.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
            const fips = item.dataset.fips;
            const county = countyList.find(c => normalizeFips(c.fips) === fips);
            if (county) {
                countySearch.value = county.name; // name already includes state
                selectedCountyFips = fips;
            }
            autocompleteList.classList.remove('active');
        });
    });

    autocompleteList.classList.add('active');
}

function handleAutocompleteKeydown(e) {
    if (!autocompleteList.classList.contains('active')) return;

    const items = autocompleteList.querySelectorAll('.autocomplete-item');
    const currentIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items.forEach((item, i) => item.classList.toggle('selected', i === nextIndex));
        items[nextIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items.forEach((item, i) => item.classList.toggle('selected', i === prevIndex));
        items[prevIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedItem = autocompleteList.querySelector('.autocomplete-item.selected');
        if (selectedItem) {
            selectedItem.click();
        }
    } else if (e.key === 'Escape') {
        autocompleteList.classList.remove('active');
    }
}

function handleSearch() {
    hideError();

    const industry = industrySelect.value;
    if (!industry) {
        showError('Please select an industry.');
        return;
    }

    if (!selectedCountyFips) {
        // Try to find county from text (name already includes state)
        const searchText = countySearch.value.trim().toLowerCase();
        const match = countyList.find(c => c.name.toLowerCase() === searchText);
        if (match) {
            selectedCountyFips = normalizeFips(match.fips);
        } else {
            showError('Please select a county from the dropdown.');
            return;
        }
    }

    // Get county data
    const countyData = cbpData[selectedCountyFips];
    if (!countyData) {
        showError('No data available for this county.');
        return;
    }

    const industryData = countyData[industry];
    if (!industryData || Object.keys(industryData).length === 0) {
        const countyName = countyData.name || 'this county';
        const industryName = INDUSTRY_NAMES[industry];
        showError(`No data available for ${industryName.toLowerCase()} in ${countyName}.`);
        return;
    }

    // Display results
    displayResults(countyData, industry, industryData);
}

function displayResults(countyData, industry, industryData) {
    const countyName = countyData.name;
    const industryName = INDUSTRY_NAMES[industry];

    // Get years and values
    const years = Object.keys(industryData).sort();
    const values = years.map(y => industryData[y]);

    // Find peak
    const maxValue = Math.max(...values);
    const peakIndex = values.indexOf(maxValue);
    const peakYear = years[peakIndex];

    // Get current (latest year)
    const currentYear = years[years.length - 1];
    const currentValue = industryData[currentYear];

    // Calculate change
    const change = currentValue - maxValue;
    const changePercent = ((change / maxValue) * 100).toFixed(0);

    // Build headline
    let headline;
    const isSparseData = maxValue < 10;

    if (peakYear === currentYear) {
        // Still growing or at peak
        const firstYear = years[0];
        const firstValue = industryData[firstYear];
        const growthPercent = (((currentValue - firstValue) / firstValue) * 100).toFixed(0);

        if (currentValue > firstValue) {
            headline = `<strong>${industryName}</strong> in ${countyName} are still growing &mdash; `;
            headline += `up <span class="change-positive">${growthPercent}%</span> since ${firstYear}. `;
            headline += `Currently: <strong>${currentValue.toLocaleString()}</strong> establishments.`;
        } else {
            headline = `<strong>${industryName}</strong> in ${countyName} peaked in <span class="peak-year">${peakYear}</span> `;
            headline += `with <strong>${maxValue.toLocaleString()}</strong> establishments.`;
        }
    } else {
        // Has peaked and declined
        headline = `<strong>${industryName}</strong> in ${countyName} peaked in <span class="peak-year">${peakYear}</span> `;
        headline += `with <strong>${maxValue.toLocaleString()}</strong> establishments. `;
        headline += `Today: ${currentValue.toLocaleString()} `;
        headline += `(<span class="change-negative">${changePercent}%</span>)`;
    }

    headlineDiv.innerHTML = headline;

    // Data note
    if (isSparseData) {
        dataNoteDiv.textContent = 'Note: Limited data for this industry in this county.';
    } else {
        dataNoteDiv.textContent = '';
    }

    // Draw chart
    drawChart(years, values, peakIndex, industryName);

    // Show results
    resultsDiv.classList.remove('hidden');

    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function drawChart(years, values, peakIndex, industryName) {
    const ctx = document.getElementById('trend-chart').getContext('2d');

    // Destroy existing chart
    if (trendChart) {
        trendChart.destroy();
    }

    // Create point colors (highlight peak)
    const pointColors = years.map((_, i) =>
        i === peakIndex ? '#dc2626' : '#2563eb'
    );
    const pointRadius = years.map((_, i) =>
        i === peakIndex ? 8 : 4
    );

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Establishments',
                data: values,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: pointColors,
                pointBorderColor: pointColors,
                pointRadius: pointRadius,
                pointHoverRadius: 8,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y.toLocaleString()} establishments`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    resultsDiv.classList.add('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
