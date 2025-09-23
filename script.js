// Configuration - UPDATE THIS WITH YOUR GOOGLE SHEETS LINK
const GOOGLE_SHEETS_URL = "YOUR_GOOGLE_SHEETS_PUBLISHED_LINK_HERE";

// Update date and time
function updateDateTime() {
    const now = new Date();
    document.getElementById('current-date').textContent = 
        now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    
    document.getElementById('current-time').textContent = 
        now.toLocaleTimeString('en-US');
}

// Convert CSV from Google Sheets to JSON
function csvToJson(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const sections = [];
    let currentSection = null;
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === 1 && !values[0]) continue; // Skip empty lines
        
        // Check if this is a section header (starts with ##)
        if (values[0] && values[0].startsWith('##')) {
            if (currentSection) sections.push(currentSection);
            currentSection = {
                title: values[0].replace('##', '').trim(),
                icon: values[1] || 'fas fa-chart-bar',
                items: [],
                stats: []
            };
        } 
        // Check if this is a stat item (starts with &&)
        else if (values[0] && values[0].startsWith('&&')) {
            if (currentSection) {
                currentSection.stats.push({
                    label: values[0].replace('&&', '').trim(),
                    value: values[1] || ''
                });
            }
        }
        // Regular item
        else if (values[0] && currentSection) {
            currentSection.items.push(values[0]);
        }
    }
    
    if (currentSection) sections.push(currentSection);
    return { lastUpdated: new Date().toISOString().split('T')[0], sections };
}

// Load data from Google Sheets
async function loadGoogleSheetsData() {
    try {
        const response = await fetch(GOOGLE_SHEETS_URL);
        const csvData = await response.text();
        const jsonData = csvToJson(csvData);
        displayData(jsonData);
    } catch (error) {
        console.error('Error loading Google Sheets data:', error);
        displayError();
    }
}

// Display data on dashboard
function displayData(data) {
    const container = document.getElementById('content-container');
    container.innerHTML = '';

    data.sections.forEach(section => {
        const sectionHTML = `
            <div class="content-section">
                <h2><i class="${section.icon}"></i> ${section.title}</h2>
                <div class="section-content">
                    ${section.items.map(item => `<p>• ${item}</p>`).join('')}
                </div>
                ${section.stats && section.stats.length > 0 ? `
                    <div class="stats-grid">
                        ${section.stats.map(stat => `
                            <div class="stat-item">
                                <div class="stat-value">${stat.value}</div>
                                <div class="stat-label">${stat.label}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        container.innerHTML += sectionHTML;
    });
}

function displayError() {
    const container = document.getElementById('content-container');
    container.innerHTML = `
        <div class="content-section" style="text-align: center;">
            <h2>⚠️ Data Loading Error</h2>
            <p>Please check if Google Sheets URL is correct and published.</p>
        </div>
    `;
}

// Initialize dashboard
function initDashboard() {
    updateDateTime();
    loadGoogleSheetsData();
    
    // Update time every second
    setInterval(updateDateTime, 1000);
    
    // Refresh data every 5 minutes
    setInterval(loadGoogleSheetsData, 5 * 60 * 1000);
}

// Start when page loads
document.addEventListener('DOMContentLoaded', initDashboard);
