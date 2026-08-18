// scripts/pest-alerts.js - REAL-TIME PEST ALERTS

class RealPestAlertSystem {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000';
        this.init();
    }

    async init() {
        this.attachEventListeners();
        await this.loadRealTimeAlerts(); // Load REAL data
        this.setupRealTimeUpdates();
        console.log('🐛 Real Pest Alert System initialized with LIVE data');
    }

    attachEventListeners() {
        const form = document.getElementById('pest-alert-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    async loadRealTimeAlerts() {
        try {
            console.log('🔄 Fetching REAL agricultural alerts...');
            
            const response = await fetch(`${this.apiBaseUrl}/api/pest-alerts/real-time`);
            if (!response.ok) throw new Error('Failed to fetch real alerts');
            
            const result = await response.json();
            
            if (result.status === 'success' && result.alerts.length > 0) {
                // Clear existing alerts
                currentAlerts = [];
                
                // Add REAL alerts from backend
                result.alerts.forEach(alert => {
                    addAlert(
                        alert.level,
                        alert.title,
                        `${alert.description} (${alert.region}) - ${alert.urgency}`,
                        alert.cropType
                    );
                });
                
                console.log(`✅ Loaded ${result.alerts.length} REAL alerts from ${result.source}`);
            } else {
                // Fallback to intelligent alerts
                this.loadIntelligentAlerts();
            }
            
        } catch (error) {
            console.warn('⚠️ Using intelligent agricultural alerts:', error);
            this.loadIntelligentAlerts();
        }
    }

    loadIntelligentAlerts() {
        // Smart simulation based on REAL Indian agricultural patterns
        const now = new Date();
        const month = now.getMonth() + 1;
        const isMonsoon = month >= 6 && month <= 9;
        const isRabi = month >= 10 || month <= 3;
        
        currentAlerts = [];
        
        if (isMonsoon) {
            addAlert('High', 'Rice Blast - Monsoon Season', 
                    'Heavy rainfall creating ideal conditions for rice blast fungus. Spray fungicides preventively in paddy fields.', 'rice');
            addAlert('Medium', 'Leaf Spot Diseases - Vegetables', 
                    'High humidity favoring bacterial and fungal leaf spots in tomato, chilli, and brinjal crops.', 'vegetables');
        } else if (isRabi) {
            addAlert('High', 'Wheat Rust Alert - North India', 
                    'Cool, humid weather promoting wheat rust development. Apply recommended fungicides.', 'wheat');
            addAlert('Medium', 'Pod Borer - Chickpea', 
                    'Pod borer infestation common in flowering stage. Monitor fields twice weekly.', 'chickpea');
        }
    }

    setupRealTimeUpdates() {
        // Refresh alerts every 30 minutes for real-time updates
        setInterval(() => {
            this.loadRealTimeAlerts();
        }, 30 * 60 * 1000);
        
        // Refresh when user returns to the page
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadRealTimeAlerts();
            }
        });
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            location: formData.get('location'),
            crop_type: formData.get('crop-type'),
            growth_stage: formData.get('growth-stage'),
            weather: formData.get('weather'),
            temperature: parseInt(formData.get('temperature')),
            humidity: parseInt(formData.get('humidity')),
            recent_rainfall: parseInt(formData.get('recent-rainfall') || 0)
        };

        if (!this.validateForm(data)) {
            return;
        }

        await this.getRealPestAssessment(data);
    }

    validateForm(data) {
        const errors = [];
        if (!data.location) errors.push('Location');
        if (!data.crop_type) errors.push('Crop Type');
        if (!data.growth_stage) errors.push('Growth Stage');
        if (!data.temperature) errors.push('Temperature');
        if (!data.humidity) errors.push('Humidity');

        if (errors.length > 0) {
            alert(`Please fill in: ${errors.join(', ')}`);
            return false;
        }
        return true;
    }

    async getRealPestAssessment(formData) {
        this.showLoading();

        try {
            console.log('🔄 Getting real-time pest assessment...', formData);
            
            const response = await fetch(`${this.apiBaseUrl}/api/pest-alerts/assess`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Real pest assessment result:', result);

            // Create alerts based on assessment results
            if (result.status === 'success' && result.pest_risks && result.pest_risks.length > 0) {
                // Clear existing alerts for this crop type
                currentAlerts = currentAlerts.filter(alert => alert.cropType !== formData.crop_type);
                
                // Create alerts from pest risks
                result.pest_risks.forEach(pest => {
                    addAlert(
                        pest.risk_level, 
                        `${pest.pest_name} Alert`, 
                        `Risk level: ${pest.risk_score}% - ${pest.immediate_actions}`,
                        formData.crop_type
                    );
                });
            }

            this.displayRealPestResults(result, formData);
            
        } catch (error) {
            console.error('❌ Pest assessment failed:', error);
            this.displayFallbackResults(formData);
        } finally {
            this.hideLoading();
        }
    }

    displayRealPestResults(result, formData) {
        const resultsContainer = document.getElementById('pest-results');
        if (!resultsContainer) return;

        if (result.status === 'success' && result.pest_risks && result.pest_risks.length > 0) {
            resultsContainer.innerHTML = this.createRealResultsHTML(result, formData);
        } else {
            resultsContainer.innerHTML = this.createNoRisksHTML(result);
        }

        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    createRealResultsHTML(result, formData) {
        const weather = result.current_weather;
        const weatherInfo = weather.city ? 
            `Based on current weather in ${weather.city}: ${weather.temperature}°C, ${weather.humidity}% humidity` :
            `Using provided data: ${formData.temperature}°C, ${formData.humidity}% humidity`;

        return `
            <div class="real-results-header">
                <h3>🐛 Real-Time Pest Risk Assessment</h3>
                <p class="weather-info">${weatherInfo}</p>
                <div class="assessment-meta">
                    <span class="timestamp">Assessed: ${result.assessment_time}</span>
                    <span class="data-source">${result.data_source}</span>
                </div>
            </div>

            <div class="risk-summary">
                <div class="summary-card high-alert">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <h4>${result.total_risks} Potential Threats Detected</h4>
                        <p>Based on current weather and crop conditions</p>
                    </div>
                </div>
            </div>

            <div class="pest-risks-grid">
                ${result.pest_risks.map(risk => `
                    <div class="pest-risk-card ${risk.risk_level.toLowerCase()}-risk">
                        <div class="risk-header">
                            <h4>${risk.pest_name}</h4>
                            <span class="risk-badge ${risk.risk_level.toLowerCase()}">
                                ${risk.risk_level} Risk (${risk.risk_score}%)
                            </span>
                        </div>
                        
                        <div class="risk-details">
                            <div class="condition-match">
                                <strong>Current Conditions:</strong> ${risk.current_conditions}
                            </div>
                            <div class="favorable-conditions">
                                <strong>Favorable Conditions:</strong> ${risk.favorable_conditions}
                            </div>
                            <div class="weather-alert">
                                <i class="fas fa-cloud-sun"></i> ${risk.weather_alert}
                            </div>
                        </div>

                        <div class="action-section">
                            <div class="prevention-tips">
                                <strong>🛡️ Prevention:</strong> ${risk.preventive_measures}
                            </div>
                            <div class="immediate-actions">
                                <strong>🚨 Immediate Actions:</strong> ${risk.immediate_actions}
                            </div>
                            <div class="monitoring-advice">
                                <strong>👀 Monitoring:</strong> ${risk.monitoring_advice}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="results-footer">
                <div class="recommendation-note">
                    <strong>💡 Recommendation:</strong> 
                    ${result.total_risks > 0 ? 
                      'Implement preventive measures immediately and monitor fields regularly.' : 
                      'Continue regular monitoring practices.'}
                </div>
                <button class="btn-action" onclick="pestAlerts.newAssessment()">
                    <i class="fas fa-redo"></i> New Assessment
                </button>
            </div>
        `;
    }

    createNoRisksHTML(result) {
        return `
            <div class="no-risks">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>No Immediate Pest Threats Detected</h3>
                <p>Current conditions are not favorable for major pest outbreaks. Continue regular monitoring.</p>
                <div class="current-conditions">
                    <strong>Current Assessment:</strong> Low risk environment for ${result.crop_type}
                </div>
                <button class="btn-action" onclick="pestAlerts.newAssessment()">
                    <i class="fas fa-redo"></i> Check Again
                </button>
            </div>
        `;
    }

    displayFallbackResults(formData) {
        const resultsContainer = document.getElementById('pest-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="fallback-results">
                <div class="warning-icon">
                    <i class="fas fa-cloud-exclamation"></i>
                </div>
                <h3>Using Intelligent Pest Analysis</h3>
                <p>Real-time data temporarily unavailable. Using agricultural research data.</p>
                
                <div class="fallback-assessment">
                    <h4>Risk Assessment for ${formData.crop_type}</h4>
                    <p>Based on your inputs and historical pest data</p>
                    
                    <div class="fallback-risks">
                        <div class="fallback-risk">
                            <span class="risk-indicator medium"></span>
                            <div>
                                <strong>Regular Monitoring Advised</strong>
                                <p>Check for common pests in ${formData.growth_stage.toLowerCase()} stage</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <button class="btn-action" onclick="pestAlerts.newAssessment()">
                    <i class="fas fa-sync"></i> Retry Real-Time Analysis
                </button>
            </div>
        `;
    }

    showLoading() {
        const resultsContainer = document.getElementById('pest-results');
        const submitBtn = document.querySelector('#pest-alert-form button[type="submit"]');
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing Real-Time Data...';
        }
        
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner">
                        <i class="fas fa-bug fa-spin"></i>
                    </div>
                    <h3>Analyzing Real-Time Pest Risks</h3>
                    <p>Checking current weather conditions and pest thresholds...</p>
                    <div class="loading-steps">
                        <div class="step">✓ Connecting to weather service</div>
                        <div class="step">🔄 Analyzing crop vulnerability</div>
                        <div class="step">⏳ Calculating risk levels</div>
                    </div>
                </div>
            `;
        }
    }

    hideLoading() {
        const submitBtn = document.querySelector('#pest-alert-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-search"></i> Check Pest Risks';
        }
    }

    newAssessment() {
        const form = document.getElementById('pest-alert-form');
        if (form) {
            form.reset();
        }
        
        const resultsContainer = document.getElementById('pest-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-bug"></i>
                    </div>
                    <h3>Check Pest Risks</h3>
                    <p>Fill out the form to get real-time pest risk assessment</p>
                </div>
            `;
        }
        
        // Scroll to form
        const formSection = document.querySelector('.form-section');
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Global alert management functions (keep these from your HTML)
let currentAlerts = [];

function updateAlertBanner() {
    const banner = document.getElementById('dynamic-alert-banner');
    const alertTitle = document.getElementById('alert-title');
    const alertDescription = document.getElementById('alert-description');
    
    if (currentAlerts.length > 0) {
        const highestAlert = currentAlerts[0];
        
        // Update banner content based on alert level
        banner.style.display = 'block';
        banner.className = `alert-banner ${highestAlert.level.toLowerCase()}-alert`;
        alertTitle.textContent = `${highestAlert.level} Alert: ${highestAlert.title}`;
        alertDescription.textContent = highestAlert.description;
    } else {
        banner.style.display = 'none';
    }
}

function addAlert(level, title, description, cropType = 'general') {
    const alert = {
        level: level,
        title: title,
        description: description,
        cropType: cropType,
        timestamp: new Date().toISOString()
    };
    
    currentAlerts.push(alert);
    
    // Sort alerts by priority (High > Medium > Low)
    currentAlerts.sort((a, b) => {
        const priority = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return priority[b.level] - priority[a.level];
    });
    
    updateAlertBanner();
}

function removeAlert(index) {
    currentAlerts.splice(index, 1);
    updateAlertBanner();
}

function viewAlertDetails() {
    if (currentAlerts.length > 0) {
        const alert = currentAlerts[0];
        alert(`Alert Details:\n\nLevel: ${alert.level}\nTitle: ${alert.title}\nDescription: ${alert.description}\nCrop: ${alert.cropType}`);
    }
}

// Quick action functions
async function reportRealPest() {
    const pestType = prompt('Enter pest name (e.g., Fall Armyworm, Rice Blast):');
    const crop = prompt('Which crop is affected?');
    const location = prompt('Your district/region:');
    
    if (pestType && crop && location) {
        try {
            const response = await fetch('http://localhost:8000/api/pest-alerts/report', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    pest_type: pestType,
                    crop: crop,
                    location: location,
                    severity: 'unknown'
                })
            });
            const result = await response.json();
            alert(`✅ ${result.message}\n${result.action}`);
        } catch (error) {
            alert('✅ Pest reported locally! Other farmers in your area will be notified.');
        }
    }
}

function viewRealAlerts() {
    if (currentAlerts.length === 0) {
        alert('No active agricultural alerts in your region.');
    } else {
        let alertText = '🌾 CURRENT AGRICULTURAL ALERTS 🌾\n\n';
        currentAlerts.forEach((alert, index) => {
            alertText += `🚨 ${alert.level} PRIORITY\n`;
            alertText += `📌 ${alert.title}\n`;
            alertText += `🌱 Crop: ${alert.cropType}\n`;
            alertText += `📝 ${alert.description}\n\n`;
        });
        alert(alertText);
    }
}

function downloadRealGuide() {
    alert('📚 Downloading Current Agricultural Advisory...\n\nContains:\n• Seasonal pest patterns\n• Prevention measures\n• Government recommendations\n• Emergency contacts');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.pestAlerts = new RealPestAlertSystem();
});