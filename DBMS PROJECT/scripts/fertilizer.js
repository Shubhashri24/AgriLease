// Fertilizer Guide JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('fertilizer-form');
    const phSlider = document.getElementById('soil-ph');
    const phValue = document.getElementById('ph-value');
    const nitrogenSlider = document.getElementById('nitrogen');
    const nitrogenValue = document.getElementById('nitrogen-value');
    const phosphorusSlider = document.getElementById('phosphorus');
    const phosphorusValue = document.getElementById('phosphorus-value');
    const potassiumSlider = document.getElementById('potassium');
    const potassiumValue = document.getElementById('potassium-value');
    const resultsContainer = document.getElementById('fertilizer-results');
    
    // Update slider value displays
    const updateSliderValue = (slider, valueElement, labels = ['Low', 'Medium', 'High']) => {
        if (slider && valueElement) {
            slider.addEventListener('input', function() {
                valueElement.textContent = labels[this.value - 1];
            });
        }
    };
    
    updateSliderValue(phSlider, phValue, ['4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0']);
    updateSliderValue(nitrogenSlider, nitrogenValue);
    updateSliderValue(phosphorusSlider, phosphorusValue);
    updateSliderValue(potassiumSlider, potassiumValue);
    
    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const cropType = document.getElementById('crop-type').value;
            const growthStage = document.getElementById('growth-stage').value;
            const nitrogen = parseInt(document.getElementById('nitrogen').value);
            const phosphorus = parseInt(document.getElementById('phosphorus').value);
            const potassium = parseInt(document.getElementById('potassium').value);
            const soilPh = parseFloat(document.getElementById('soil-ph').value);
            const organicMatter = document.getElementById('organic-matter').value ? parseFloat(document.getElementById('organic-matter').value) : null;
            
            // Validate form
            if (!cropType || !growthStage) {
                showError('Please fill in all required fields');
                return;
            }
            
            // Show loading state
            showLoading();
            
            // Simulate processing delay
            setTimeout(() => {
                // Get recommendations
                const recommendations = getFertilizerRecommendations(cropType, growthStage, nitrogen, phosphorus, potassium, soilPh, organicMatter);
                
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
                    <i class="fas fa-flask fa-spin"></i>
                </div>
                <h3>Analyzing Soil Nutrients</h3>
                <p>Calculating precise fertilizer requirements for your crops...</p>
            </div>
        `;
    }
    
    // Function to get fertilizer recommendations
    function getFertilizerRecommendations(cropType, growthStage, nitrogen, phosphorus, potassium, soilPh, organicMatter) {
        const recommendations = {
            deficiencies: [],
            fertilizers: [],
            applicationRates: {},
            timing: "",
            method: "",
            notes: [],
            soilHealth: ""
        };
        
        // Check for nutrient deficiencies
        if (nitrogen === 1) {
            recommendations.deficiencies.push("Nitrogen");
            recommendations.fertilizers.push("Urea (46-0-0)");
            recommendations.fertilizers.push("Ammonium Sulfate (21-0-0)");
            recommendations.applicationRates["Nitrogen"] = "120-150 kg/ha";
        } else if (nitrogen === 3) {
            recommendations.notes.push("Reduce nitrogen application to avoid excessive vegetative growth");
            recommendations.applicationRates["Nitrogen"] = "60-80 kg/ha";
        } else {
            recommendations.applicationRates["Nitrogen"] = "80-100 kg/ha";
        }
        
        if (phosphorus === 1) {
            recommendations.deficiencies.push("Phosphorus");
            recommendations.fertilizers.push("DAP (18-46-0)");
            recommendations.fertilizers.push("SSP (0-16-0)");
            recommendations.applicationRates["Phosphorus"] = "60-80 kg/ha";
        } else if (phosphorus === 3) {
            recommendations.notes.push("Maintain phosphorus levels, no additional application needed");
            recommendations.applicationRates["Phosphorus"] = "30-40 kg/ha";
        } else {
            recommendations.applicationRates["Phosphorus"] = "40-60 kg/ha";
        }
        
        if (potassium === 1) {
            recommendations.deficiencies.push("Potassium");
            recommendations.fertilizers.push("MOP (0-0-60)");
            recommendations.fertilizers.push("SOP (0-0-50)");
            recommendations.applicationRates["Potassium"] = "40-60 kg/ha";
        } else if (potassium === 3) {
            recommendations.notes.push("Potassium levels adequate, focus on other nutrients");
            recommendations.applicationRates["Potassium"] = "20-30 kg/ha";
        } else {
            recommendations.applicationRates["Potassium"] = "30-40 kg/ha";
        }
        
        // Determine application timing based on growth stage
        const timingMap = {
            'pre-sowing': 'Apply basal dose during land preparation',
            'germination': 'Light application with first irrigation',
            'vegetative': 'Top dressing during active growth',
            'flowering': 'Critical stage - ensure adequate nutrition',
            'fruiting': 'Focus on potassium for fruit development',
            'maturity': 'Reduce fertilizer application'
        };
        
        recommendations.timing = timingMap[growthStage] || 'Apply based on soil test results';
        
        // Determine application method
        recommendations.method = "Split application recommended for better efficiency";
        
        // Add crop-specific notes
        const cropNotes = {
            rice: "Split application: 50% basal, 25% tillering, 25% panicle initiation",
            wheat: "Apply phosphorus at sowing, nitrogen in splits",
            maize: "High nitrogen requirement during vegetative stage",
            cotton: "Balanced NPK with emphasis on potassium during boll formation",
            sugarcane: "Heavy feeder - requires high nitrogen throughout growth",
            vegetables: "Frequent light applications for continuous harvest",
            pulses: "Limited nitrogen required, focus on phosphorus and potassium"
        };
        
        if (cropNotes[cropType]) {
            recommendations.notes.push(cropNotes[cropType]);
        }
        
        // Add pH-related notes
        if (soilPh < 5.5) {
            recommendations.notes.push("Soil is acidic. Consider lime application (2-4 tons/ha) to improve nutrient availability");
            recommendations.soilHealth = "Acidic - needs amendment";
        } else if (soilPh > 7.5) {
            recommendations.notes.push("Soil is alkaline. Sulfur application may help lower pH");
            recommendations.soilHealth = "Alkaline - monitor pH";
        } else {
            recommendations.soilHealth = "Optimal pH range";
        }
        
        // Add organic matter notes
        if (organicMatter && organicMatter < 2) {
            recommendations.notes.push("Low organic matter. Add compost or farmyard manure (10-15 tons/ha)");
        } else if (organicMatter && organicMatter > 5) {
            recommendations.notes.push("Good organic matter content. Maintain with regular organic inputs");
        }
        
        // If no deficiencies
        if (recommendations.deficiencies.length === 0) {
            recommendations.deficiencies.push("No major deficiencies detected");
            recommendations.notes.push("Continue with balanced fertilization based on crop requirement");
        }
        
        return recommendations;
    }
    
    // Function to display recommendations
    function displayRecommendations(recommendations) {
        let html = `
            <div class="fertilizer-plan">
                <div class="plan-header">
                    <div class="plan-icon">
                        <i class="fas fa-flask"></i>
                    </div>
                    <div class="plan-info">
                        <h3>Fertilizer Plan</h3>
                        <p>Soil Health: <span class="soil-health ${recommendations.soilHealth.toLowerCase().includes('optimal') ? 'good' : 'warning'}">${recommendations.soilHealth}</span></p>
                    </div>
                </div>
                
                <div class="plan-details">
                    <div class="detail-section">
                        <h4>Nutrient Analysis</h4>
                        <div class="deficiency-list">
                            ${recommendations.deficiencies.map(def => `
                                <div class="deficiency-item">
                                    <i class="fas ${def.includes('No major') ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                                    <span>${def}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Recommended Fertilizers</h4>
                        <div class="fertilizer-list">
                            ${recommendations.fertilizers.map(fert => `
                                <div class="fertilizer-item">
                                    <i class="fas fa-cube"></i>
                                    <span>${fert}</span>
                                </div>
                            `).join('')}
                            ${recommendations.fertilizers.length === 0 ? '<p>Maintain current fertilizer program</p>' : ''}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Application Rates (per hectare)</h4>
                        <div class="rate-grid">
                            ${Object.entries(recommendations.applicationRates).map(([nutrient, rate]) => `
                                <div class="rate-item">
                                    <span class="nutrient-name">${nutrient}</span>
                                    <span class="nutrient-rate">${rate}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Application Schedule</h4>
                        <div class="schedule-info">
                            <div class="schedule-item">
                                <strong>Timing:</strong> ${recommendations.timing}
                            </div>
                            <div class="schedule-item">
                                <strong>Method:</strong> ${recommendations.method}
                            </div>
                        </div>
                    </div>
                </div>
                
                ${recommendations.notes.length > 0 ? `
                    <div class="recommendation-notes">
                        <h4>Important Notes</h4>
                        <ul>
                            ${recommendations.notes.map(note => `<li>${note}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
        
        resultsContainer.innerHTML = html;
    }
});