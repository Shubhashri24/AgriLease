// Form submission for crop recommendation - WORKING VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log("🟢 Crop recommendation script loaded");
    
    const form = document.getElementById('crop-recommendation-form');
    
    // Real-time value updates for range sliders
    const sliders = document.querySelectorAll('.range-slider');
    sliders.forEach(slider => {
        const valueSpan = document.getElementById(slider.id + '-value');
        if (valueSpan) {
            // Set initial value
            valueSpan.textContent = slider.value;
            
            // Update on change
            slider.addEventListener('input', function() {
                valueSpan.textContent = this.value;
            });
        }
    });

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log("🟡 Form submitted");
            
            // Get form data from range sliders
            const formData = {
                nitrogen: parseInt(document.getElementById('nitrogen').value),
                phosphorus: parseInt(document.getElementById('phosphorus').value),
                potassium: parseInt(document.getElementById('potassium').value),
                temperature: parseFloat(document.getElementById('temperature').value),
                humidity: parseFloat(document.getElementById('humidity').value),
                ph: parseFloat(document.getElementById('ph-level').value),
                rainfall: parseFloat(document.getElementById('rainfall').value)
            };
            
            console.log("📤 Sending data:", formData);
            
            // Validate required fields
            const required = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'ph', 'rainfall'];
            let hasError = false;
            
            for (let field of required) {
                if (formData[field] === undefined || formData[field] === null || isNaN(formData[field])) {
                    alert(`Please fill in ${field} field`);
                    hasError = true;
                    break;
                }
            }
            
            if (hasError) return;
            
            try {
                // Show loading state
                const submitBtn = document.querySelector('.btn-submit');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing Soil Data...';
                submitBtn.disabled = true;
                
                // Show loading in results
                const resultsContainer = document.getElementById('recommendation-results');
                resultsContainer.innerHTML = `
                    <div class="loading-state">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i>
                        </div>
                        <h3>Analyzing Your Soil Data</h3>
                        <p>Our AI is finding the best crops for your conditions...</p>
                    </div>
                `;
                
                // Send request to backend
                console.log("🟡 Sending crop recommendation request...");
                
                const response = await fetch('http://localhost:8000/crop-recommendation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                console.log("🟡 Response status:", response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("❌ Server response error:", response.status, errorText);
                    throw new Error(`Server error: ${response.status} - ${errorText}`);
                }
                
                const data = await response.json();
                console.log("✅ Received data:", data);
                
                // Display recommendations
                displayCropRecommendations(data);
                
            } catch (error) {
                console.error('❌ Error:', error);
                
                // Show user-friendly error message
                const resultsContainer = document.getElementById('recommendation-results');
                resultsContainer.innerHTML = `
                    <div class="error-state">
                        <div class="error-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3>Request Failed</h3>
                        <p>${error.message}</p>
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
                            <strong>Troubleshooting Steps:</strong>
                            <ol>
                                <li>Make sure backend is running on port 8000</li>
                                <li>Check browser console (F12) for detailed errors</li>
                                <li>Verify all form fields are filled</li>
                                <li>Try the test connection below</li>
                            </ol>
                        </div>
                        <button class="btn-action" onclick="testBackendConnection()">
                            <i class="fas fa-vial"></i> Test Backend Connection
                        </button>
                    </div>
                `;
            } finally {
                // Reset button state
                const submitBtn = document.querySelector('.btn-submit');
                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="fas fa-brain"></i> Get AI Recommendations';
                    submitBtn.disabled = false;
                }
            }
        });
    }
});

// Test backend connection
window.testBackendConnection = async function() {
    console.log("🧪 Testing backend connection...");
    
    const resultsContainer = document.getElementById('recommendation-results');
    resultsContainer.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner">
                <i class="fas fa-vial"></i>
            </div>
            <h3>Testing Backend Connection</h3>
            <p>Checking if the server is running...</p>
        </div>
    `;

    try {
        // Test basic connectivity
        const response = await fetch('http://localhost:8000/health');
        const data = await response.json();
        
        console.log("🧪 Health check:", data);
        
        if (!response.ok) {
            throw new Error(`Health check failed: ${response.status}`);
        }

        resultsContainer.innerHTML = `
            <div class="recommendations-header">
                <h3>✅ Backend Connection Successful</h3>
                <p>Server is running and responsive</p>
            </div>
            <div style="text-align: left; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px; border-radius: 10px;">
                <h4>Backend Status:</h4>
                <ul>
                    <li>✅ Server: Running on port 8000</li>
                    <li>✅ Model Loaded: ${data.model_loaded ? 'Yes' : 'No'}</li>
                    <li>✅ Status: ${data.status}</li>
                </ul>
                <p><strong>Now try submitting the form again.</strong></p>
            </div>
        `;

    } catch (error) {
        console.error('❌ Test failed:', error);
        resultsContainer.innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-bug"></i>
                </div>
                <h3>Backend Connection Failed</h3>
                <p>${error.message}</p>
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
                    <strong>To fix this:</strong>
                    <ol>
                        <li>Make sure your FastAPI backend is running</li>
                        <li>Run: <code>python app.py</code> in your backend folder</li>
                        <li>Check that port 8000 is available</li>
                        <li>Look for errors in the backend terminal</li>
                    </ol>
                </div>
                <button class="btn-action" onclick="location.reload()">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
};

function displayCropRecommendations(data) {
    console.log("🟡 Displaying recommendations:", data);
    
    const resultsContainer = document.getElementById('recommendation-results');
    
    if (!resultsContainer) {
        console.error("❌ Results container not found");
        return;
    }
    
    if (data.status === 'success' && data.recommended_crops && data.recommended_crops.length > 0) {
        // Sort crops by confidence score (highest first)
        const sortedCrops = data.recommended_crops.sort((a, b) => b.confidence - a.confidence);
        
        resultsContainer.innerHTML = `
            <div class="recommendations-header">
                <h3>🌱 AI Crop Recommendations</h3>
                <p class="recommendations-count">${data.message}</p>
            </div>
            <div class="crops-grid">
                ${sortedCrops.map((crop, index) => {
                    // Determine suitability class
                    let suitabilityClass = 'low-suitability';
                    if (crop.confidence > 70) suitabilityClass = 'high-suitability';
                    else if (crop.confidence > 40) suitabilityClass = 'medium-suitability';
                    
                    // Format crop name
                    const cropName = crop.name ? crop.name.charAt(0).toUpperCase() + crop.name.slice(1) : 'Unknown Crop';
                    
                    return `
                    <div class="crop-card" style="animation-delay: ${index * 0.1}s">
                        <div class="crop-icon">
                            <i class="fas fa-seedling"></i>
                        </div>
                        <div class="crop-name">${cropName}</div>
                        <div class="crop-confidence ${suitabilityClass}">
                            ${crop.confidence}% Match
                        </div>
                        <div class="crop-details">
                            <div class="detail-item">
                                <strong>Type:</strong> ${crop.type || 'N/A'}
                            </div>
                            <div class="detail-item">
                                <strong>Season:</strong> ${crop.season || 'N/A'}
                            </div>
                            <div class="detail-item">
                                <strong>Water Needs:</strong> ${crop.water || crop.water_needs || 'N/A'}
                            </div>
                            <div class="detail-item">
                                <strong>Duration:</strong> ${crop.duration || 'N/A'}
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
            <div class="recommendations-footer">
                <p><strong>💡 Tip:</strong> Consider crop rotation and local market demand when making your final selection.</p>
            </div>
        `;
    } else {
        resultsContainer.innerHTML = `
            <div class="no-recommendations">
                <div class="empty-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>No Suitable Crops Found</h3>
                <p>${data.message || 'No crops match your current soil and climate conditions. Try adjusting your parameters.'}</p>
                <button class="btn-action" onclick="document.getElementById('crop-recommendation-form').reset(); updateSliderValues();">
                    <i class="fas fa-redo"></i> Reset Form
                </button>
            </div>
        `;
    }
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Helper function to update slider values after reset
function updateSliderValues() {
    const sliders = document.querySelectorAll('.range-slider');
    sliders.forEach(slider => {
        const valueSpan = document.getElementById(slider.id + '-value');
        if (valueSpan) {
            valueSpan.textContent = slider.value;
        }
    });
}