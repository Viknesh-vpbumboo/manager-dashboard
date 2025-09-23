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
    
    // Set next refresh time (24 hours from now)
    const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    document.getElementById('next-refresh').textContent = 
        nextRefresh.toLocaleString();
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        displayData(data);
    } catch (error) {
        console.error('Error loading data:', error);
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
                    ${Array.isArray(section.items) ? 
                        section.items.map(item => `<p>• ${item}</p>`).join('') : 
                        section.items
                    }
                </div>
                ${section.stats ? `
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
            <p>Please check if data.json file exists and is properly formatted.</p>
        </div>
    `;
}

// Initialize dashboard
function initDashboard() {
    updateDateTime();
    loadDashboardData();
    
    // Update time every second
    setInterval(updateDateTime, 1000);
    
    // Refresh data every hour
    setInterval(loadDashboardData, 60 * 60 * 1000);
}

// Start when page loads
document.addEventListener('DOMContentLoaded', initDashboard);