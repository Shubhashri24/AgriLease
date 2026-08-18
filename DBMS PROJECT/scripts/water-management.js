// Water Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('water-management-form');
    const moistureSlider = document.getElementById('soil-moisture');
    const moistureValue = document.getElementById('moisture-value');
    const resultsContainer = document.getElementById('water-results');
    
    // Update moisture value display
    if (moistureSlider && moistureValue) {
        moistureSlider.addEventListener('input', function() {
            moistureValue.textContent = `${this.value}%`;
        });
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const cropType = document.getElementById('crop-type').value;
            const growthStage = document.getElementById('growth-stage').value;
            const soilMoisture = parseInt(document.getElementById('soil-moisture').value);
            const weather = document.getElementById('weather').value;
            const temperature = parseInt(document.getElementById('temperature').value);
            const humidity = document.getElementById('humidity').value ? parseInt(document.getElementById('humidity').value) : 60;
            const irrigationType = document.getElementById('irrigation-type').value;
            
            // Validate form
            if (!cropType || !growthStage || !weather || !temperature) {
                showError('Please fill in all required fields');
                return;
            }
            
            // Show loading state
            showLoading();
            
            // Simulate processing delay
            setTimeout(() => {
                // Get recommendations
                const recommendations = getWaterRecommendations(cropType, growthStage, soilMoisture, weather, temperature, humidity, irrigationType);
                
                // Display results
                displayRecommendations(recommendations);
            }, 1500);
        });
    }
    
    function showError(message) {
        resultsContainer.innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }
    
    function showLoading() {
        resultsContainer.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner">
                    <i class="fas fa-tint fa-spin"></i>
                </div>
                <h3>Calculating Irrigation Schedule</h3>
                <p>Analyzing soil moisture, weather conditions, and crop requirements...</p>
            </div>
        `;
    }
    
    // Function to get water recommendations
    function getWaterRecommendations(cropType, growthStage, soilMoisture, weather, temperature, humidity, irrigationType) {
        const recommendations = {
            irrigationNeeded: soilMoisture < 30,
            schedule: "",
            amount: "",
            frequency: "",
            duration: "",
            efficiency: "",
            waterSaved: 0,
            notes: []
        };
        
        // Determine irrigation urgency and schedule
        if (soilMoisture < 20) {
            recommendations.schedule = "Immediate irrigation required";
            recommendations.amount = "Heavy watering (40-50 mm)";
            recommendations.frequency = "Today only";
            recommendations.duration = "2-3 hours";
            recommendations.efficiency = "Critical";
        } else if (soilMoisture < 30) {
            recommendations.schedule = "Irrigate within 24 hours";
            recommendations.amount = "Moderate watering (30-40 mm)";
            recommendations.frequency = "Once this cycle";
            recommendations.duration = "1-2 hours";
            recommendations.efficiency = "High Priority";
        } else if (soilMoisture < 40) {
            recommendations.schedule = "Irrigate in 2-3 days";
            recommendations.amount = "Light watering (20-30 mm)";
            recommendations.frequency = "Monitor closely";
            recommendations.duration = "45-90 minutes";
            recommendations.efficiency = "Optimal";
        } else {
            recommendations.schedule = "No irrigation needed currently";
            recommendations.amount = "Monitor soil moisture";
            recommendations.frequency = "Check daily";
            recommendations.duration = "N/A";
            recommendations.efficiency = "Good";
        }
        
        // Calculate water savings
        recommendations.waterSaved = Math.max(0, 40 - soilMoisture);
        
        // Add crop-specific notes
        const cropNotes = {
            rice: "Maintain standing water of 5-7 cm during vegetative stage",
            wheat: "Critical stages: crown root initiation, flowering, milk stage",
            cotton: "Avoid water stress during flowering and boll formation",
            sugarcane: "Requires consistent moisture throughout growth cycle",
            maize: "Most critical during tasseling and silking stages",
            vegetables: "Frequent light irrigation for most vegetables"
        };
        
        if (cropNotes[cropType]) {
            recommendations.notes.push(cropNotes[cropType]);
        }
        
        // Add growth stage notes
        if (growthStage === "flowering" || growthStage === "fruiting") {
            recommendations.notes.push("This is a critical growth stage - ensure adequate moisture");
        }
        
        // Add weather-specific notes
        if (weather === "hot-dry" || temperature > 35) {
            recommendations.notes.push("Increase irrigation frequency due to high evaporation");
            recommendations.waterSaved -= 5; // Adjust for weather conditions
        } else if (weather === "rainy") {
            recommendations.notes.push("Reduce irrigation if rainfall is expected in next 24 hours");
            recommendations.waterSaved += 10;
        }
        
        // Add irrigation system notes
        const systemEfficiency = {
            drip: "Drip irrigation: 90% efficiency",
            sprinkler: "Sprinkler system: 75% efficiency", 
            flood: "Flood irrigation: 60% efficiency",
            manual: "Manual watering: 70% efficiency"
        };
        
        if (systemEfficiency[irrigationType]) {
            recommendations.notes.push(systemEfficiency[irrigationType]);
        }
        
        return recommendations;
    }
    
    // Function to display recommendations
    function displayRecommendations(recommendations) {
        const urgencyColor = recommendations.irrigationNeeded ? '#e74c3c' : '#27ae60';
        const urgencyIcon = recommendations.irrigationNeeded ? 'fa-exclamation-triangle' : 'fa-check-circle';
        
        let html = `
            <div class="water-schedule">
                <div class="schedule-header">
                    <div class="schedule-icon" style="background: ${urgencyColor}">
                        <i class="fas ${urgencyIcon}"></i>
                    </div>
                    <div class="schedule-info">
                        <h3>${recommendations.schedule}</h3>
                        <p>Current soil moisture: ${document.getElementById('soil-moisture').value}%</p>
                    </div>
                </div>
                
                <div class="schedule-details">
                    <div class="schedule-item">
                        <span class="schedule-label">Water Amount</span>
                        <span class="schedule-value">${recommendations.amount}</span>
                    </div>
                    <div class="schedule-item">
                        <span class="schedule-label">Frequency</span>
                        <span class="schedule-value">${recommendations.frequency}</span>
                    </div>
                    <div class="schedule-item">
                        <span class="schedule-label">Duration</span>
                        <span class="schedule-value">${recommendations.duration}</span>
                    </div>
                    <div class="schedule-item">
                        <span class="schedule-label">Efficiency</span>
                        <span class="schedule-value">${recommendations.efficiency}</span>
                    </div>
                </div>
        `;
        
        if (recommendations.waterSaved > 0) {
            html += `
                <div class="water-alert">
                    <i class="fas fa-tint"></i>
                    <p>Potential water savings: ${recommendations.waterSaved}% compared to traditional methods</p>
                </div>
            `;
        }
        
        if (recommendations.notes.length > 0) {
            html += `
                <div class="recommendation-notes">
                    <h4>Important Notes:</h4>
                    <ul>
                        ${recommendations.notes.map(note => `<li>${note}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        html += `</div>`;
        
        resultsContainer.innerHTML = html;
    }
});