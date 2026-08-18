// Urban Gardening JavaScript functionality
class UrbanGardening {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000/api';
        this.isInitialized = false;
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            await this.loadFormOptions();
            this.attachEventListeners();
            this.isInitialized = true;
            console.log('🌿 Urban Gardening initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Urban Gardening:', error);
            this.showError('Failed to initialize the gardening tool. Please refresh the page.');
        }
    }

    async loadFormOptions() {
        try {
            console.log('🔄 Loading urban gardening options...');
            
            // Try to get options from backend
            const response = await fetch(`${this.apiBaseUrl}/urban-gardening/options`);
            
            if (response.ok) {
                const options = await response.json();
                console.log('✅ Options loaded from backend:', options);
                
                // Populate dropdowns with backend data
                this.populateDropdown('city', options.cities || []);
                this.populateDropdown('areaType', options.area_types || []);
                this.populateDropdown('month', options.months || []);
                this.populateDropdown('containerType', options.container_types || []);
            } else {
                throw new Error('Backend not available');
            }
            
        } catch (error) {
            console.error('Error loading form options:', error);
            // Use fallback options
            this.populateFallbackOptions();
            console.log('🔄 Using fallback options');
        }
    }

    populateFallbackOptions() {
        const fallbackOptions = {
            cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Chandigarh', 'Jaipur', 'Lucknow'],
            area_types: ['Balcony', 'Terrace', 'Windowsill', 'Indoor', 'Backyard', 'Rooftop'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            container_types: ['Small pots', 'Medium pots', 'Large containers', 'Vertical planters', 'Hanging baskets', 'Grow bags', 'Window boxes']
        };

        this.populateDropdown('city', fallbackOptions.cities);
        this.populateDropdown('areaType', fallbackOptions.area_types);
        this.populateDropdown('month', fallbackOptions.months);
        this.populateDropdown('containerType', fallbackOptions.container_types);
    }

    populateDropdown(elementId, options) {
        const dropdown = document.getElementById(elementId);
        if (!dropdown) {
            console.error(`Dropdown element #${elementId} not found`);
            return;
        }

        // Clear existing options except the first one
        const firstOption = dropdown.querySelector('option');
        dropdown.innerHTML = '';
        if (firstOption) {
            dropdown.appendChild(firstOption);
        }

        // Add new options
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            dropdown.appendChild(optionElement);
        });
    }

    attachEventListeners() {
        const form = document.getElementById('urbanGardeningForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Add input validation
        this.addInputValidation();
    }

    addInputValidation() {
        const spaceSizeInput = document.getElementById('spaceSize');
        if (spaceSizeInput) {
            spaceSizeInput.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                if (value < 1) e.target.value = 1;
                if (value > 200) e.target.value = 200;
            });
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            city: formData.get('city'),
            areaType: formData.get('areaType'),
            sunlightHours: formData.get('sunlightHours'),
            containerType: formData.get('containerType'),
            timeCommitment: formData.get('timeCommitment'),
            month: formData.get('month'),
            spaceSize: parseInt(formData.get('spaceSize'))
        };

        // Validate form
        if (!this.validateForm(data)) {
            return;
        }

        await this.getRecommendations(data);
    }

    validateForm(data) {
        const errors = [];

        // Check required fields
        for (const [key, value] of Object.entries(data)) {
            if (!value) {
                errors.push(this.formatFieldName(key));
            }
        }

        // Validate space size
        if (data.spaceSize && (data.spaceSize < 1 || data.spaceSize > 200)) {
            errors.push('Space size must be between 1 and 200 sq ft');
        }

        if (errors.length > 0) {
            this.showError(`Please fix the following errors:\n• ${errors.join('\n• ')}`);
            return false;
        }

        return true;
    }

    formatFieldName(fieldName) {
        const names = {
            city: 'City',
            areaType: 'Gardening Area',
            sunlightHours: 'Sunlight Hours',
            containerType: 'Container Type',
            timeCommitment: 'Time Commitment',
            month: 'Month',
            spaceSize: 'Space Size'
        };
        return names[fieldName] || fieldName;
    }

    async getRecommendations(data) {
        this.showLoading('Analyzing your garden conditions and finding perfect plants...');
        
        try {
            console.log('🔄 Sending request to backend:', data);
            
            const response = await fetch(`${this.apiBaseUrl}/urban-gardening/recommend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Received recommendations:', result);

            if (result.error) {
                throw new Error(result.error);
            }

            this.displayRecommendations(result, data);
            
        } catch (error) {
            console.error('Error getting recommendations:', error);
            // Use fallback recommendations
            this.displayFallbackRecommendations(data);
        } finally {
            this.hideLoading();
        }
    }

    displayRecommendations(result, inputData) {
        const resultsContainer = document.getElementById('recommendation-results');
        
        if (result.status === 'success' && result.recommended_plants && result.recommended_plants.length > 0) {
            // Display garden setup information
            const setupHTML = this.createGardenSetupHTML(inputData);
            
            // Display plant recommendations
            const plantsHTML = this.createPlantsHTML(result.recommended_plants);
            
            resultsContainer.innerHTML = `
                <div class="recommendations-header">
                    <h3>🌿 Your Personalized Plant Recommendations</h3>
                    <p class="recommendations-count">Based on your garden setup and preferences</p>
                </div>
                
                <div class="garden-setup">
                    ${setupHTML}
                </div>
                
                <div class="plants-grid">
                    ${plantsHTML}
                </div>
                
                <div class="results-actions">
                    <button class="btn-action" onclick="urbanGardening.resetForm()">
                        <i class="fas fa-redo"></i>
                        Start New Search
                    </button>
                    <button class="btn-action" onclick="window.print()">
                        <i class="fas fa-print"></i>
                        Print Recommendations
                    </button>
                </div>
                
                <div class="recommendations-footer">
                    <p><strong>💡 Tip:</strong> Consider starting with 2-3 plants that match your space and time commitment.</p>
                </div>
            `;
        } else {
            this.showError('No recommendations available. Please try different parameters.');
        }
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    createGardenSetupHTML(inputData) {
        const setupItems = [
            { label: 'Location', value: inputData.city, icon: 'fas fa-map-marker-alt' },
            { label: 'Gardening Area', value: inputData.areaType, icon: 'fas fa-home' },
            { label: 'Space Available', value: `${inputData.spaceSize} sq ft`, icon: 'fas fa-ruler-combined' },
            { label: 'Daily Sunlight', value: inputData.sunlightHours, icon: 'fas fa-sun' },
            { label: 'Container Type', value: inputData.containerType, icon: 'fas fa-box' },
            { label: 'Time Commitment', value: inputData.timeCommitment, icon: 'fas fa-clock' },
            { label: 'Planting Month', value: inputData.month, icon: 'fas fa-calendar' }
        ];

        return `
            <div class="setup-header">
                <div class="setup-icon">
                    <i class="fas fa-seedling"></i>
                </div>
                <div class="setup-info">
                    <h3>Your Garden Setup</h3>
                    <p>Perfect plants for your specific conditions</p>
                </div>
            </div>
            <div class="setup-details">
                ${setupItems.map(item => `
                    <div class="setup-item">
                        <span class="setup-label">
                            <i class="${item.icon}"></i> ${item.label}
                        </span>
                        <span class="setup-value">${item.value}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    createPlantsHTML(plants) {
        return plants.map((plant, index) => {
            const suitabilityClass = this.getSuitabilityClass(plant.suitability);
            const suitabilityTextClass = `suitability-${plant.suitability.toLowerCase()}`;
            const emoji = this.getPlantEmoji(plant.name);
            
            return `
                <div class="plant-card ${suitabilityClass}">
                    <div class="plant-rank">#${plant.position}</div>
                    <div class="plant-header">
                        <div class="plant-info">
                            <h3 class="plant-name">${plant.name}</h3>
                            <span class="plant-suitability ${suitabilityTextClass}">
                                ${plant.suitability} Suitability
                            </span>
                        </div>
                        <div class="plant-emoji">${emoji}</div>
                    </div>
                    <div class="plant-tips">
                        <div class="tips-title">🌿 Gardening Tips:</div>
                        <div class="tips-content">${plant.tips}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getSuitabilityClass(suitability) {
        const classes = {
            'High': 'high-suitability',
            'Medium': 'medium-suitability',
            'Good': 'good-suitability'
        };
        return classes[suitability] || 'good-suitability';
    }

    getPlantEmoji(plantName) {
        const emojiMap = {
            'Tomato': '🍅',
            'Basil': '🌿',
            'Mint': '🌱',
            'Chili': '🌶️',
            'Coriander': '🌿',
            'Spinach': '🥬',
            'Lettuce': '🥬',
            'Cucumber': '🥒',
            'Brinjal': '🍆',
            'Okra': '🥬',
            'Bell Pepper': '🫑',
            'Carrot': '🥕',
            'Radish': '🌶️',
            'Lemon Grass': '🌾',
            'Microgreens': '🌱',
            'Strawberry': '🍓',
            'Cabbage': '🥬',
            'Cauliflower': '🥦',
            'Broccoli': '🥦',
            'Snake Plant': '🐍',
            'Spider Plant': '🕷️',
            'Peace Lily': '⚜️',
            'ZZ Plant': '💤',
            'Aloe Vera': '🌵',
            'Herbs': '🌿'
        };
        
        for (const [key, emoji] of Object.entries(emojiMap)) {
            if (plantName.toLowerCase().includes(key.toLowerCase())) {
                return emoji;
            }
        }
        
        return '🌱'; // Default plant emoji
    }

    displayFallbackRecommendations(inputData) {
        console.log('🔄 Using fallback recommendations');
        
        // Simple fallback recommendations based on city and area type
        const fallbackPlants = this.generateFallbackRecommendations(inputData);
        
        const result = {
            status: 'success',
            recommended_plants: fallbackPlants,
            note: 'Using intelligent fallback recommendations'
        };
        
        this.displayRecommendations(result, inputData);
    }

    generateFallbackRecommendations(inputData) {
        // Simple rule-based fallback recommendations
        const plants = [];
        
        // Base recommendations on area type
        if (inputData.areaType.toLowerCase().includes('balcony') || 
            inputData.areaType.toLowerCase().includes('windowsill')) {
            plants.push(
                {
                    name: 'Basil',
                    position: 1,
                    suitability: 'High',
                    tips: 'Perfect for small spaces. Pinch flowers to encourage leaf growth. Prefers warm weather and plenty of sunlight.'
                },
                {
                    name: 'Mint',
                    position: 2,
                    suitability: 'High',
                    tips: 'Grows vigorously in containers. Keep in partial shade with moist soil. Great for teas and cooking.'
                },
                {
                    name: 'Microgreens',
                    position: 3,
                    suitability: 'Medium',
                    tips: 'Fast-growing and nutrient-dense. Harvest in 1-3 weeks. Perfect for limited space gardening.'
                }
            );
        } else if (inputData.areaType.toLowerCase().includes('terrace') || 
                   inputData.areaType.toLowerCase().includes('rooftop')) {
            plants.push(
                {
                    name: 'Tomato',
                    position: 1,
                    suitability: 'High',
                    tips: 'Provide support stakes and regular watering. Needs 6+ hours of sunlight. Harvest when fruits are fully colored.'
                },
                {
                    name: 'Chili',
                    position: 2,
                    suitability: 'High',
                    tips: 'Thrives in warm weather. Needs plenty of sunlight and well-drained soil. Harvest when fruits reach desired color.'
                },
                {
                    name: 'Cucumber',
                    position: 3,
                    suitability: 'Medium',
                    tips: 'Needs vertical support and regular feeding. Harvest when firm and green. Prefers consistent moisture.'
                }
            );
        } else {
            // Default recommendations
            plants.push(
                {
                    name: 'Spinach',
                    position: 1,
                    suitability: 'High',
                    tips: 'Fast-growing leafy green. Prefers cooler weather. Harvest outer leaves regularly.'
                },
                {
                    name: 'Coriander',
                    position: 2,
                    suitability: 'Medium',
                    tips: 'Harvest leaves regularly to prevent bolting. Prefers cooler weather and moderate sunlight.'
                },
                {
                    name: 'Aloe Vera',
                    position: 3,
                    suitability: 'Good',
                    tips: 'Low maintenance succulent. Great for indoor spaces. Requires minimal watering.'
                }
            );
        }
        
        return plants;
    }

    showLoading(message = 'Loading...') {
        const resultsContainer = document.getElementById('recommendation-results');
        const submitBtn = document.querySelector('#urbanGardeningForm button[type="submit"]');
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        }
        
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <h3>Finding Perfect Plants for You</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    hideLoading() {
        const submitBtn = document.querySelector('#urbanGardeningForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-seedling"></i> Get Plant Recommendations';
        }
    }

    showError(message) {
        const resultsContainer = document.getElementById('recommendation-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Request Failed</h3>
                    <p>${message}</p>
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
                        <strong>Troubleshooting Steps:</strong>
                        <ol>
                            <li>Make sure backend is running on port 8000</li>
                            <li>Check all form fields are filled correctly</li>
                            <li>Try different parameters</li>
                        </ol>
                    </div>
                    <button class="btn-action" onclick="urbanGardening.resetForm()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
        }
    }

    resetForm() {
        const form = document.getElementById('urbanGardeningForm');
        if (form) {
            form.reset();
        }
        
        const resultsContainer = document.getElementById('recommendation-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-seedling"></i>
                    </div>
                    <h3>Enter Garden Details</h3>
                    <p>Fill out the form to get personalized plant recommendations</p>
                </div>
            `;
        }
        
        // Scroll back to form
        const formSection = document.querySelector('.form-section');
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize urban gardening
    window.urbanGardening = new UrbanGardening();
    
    console.log('🚀 Urban Gardening page loaded successfully');
});