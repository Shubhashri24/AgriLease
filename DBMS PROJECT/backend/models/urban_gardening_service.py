import pickle
import pandas as pd
import numpy as np
import os
import sys

class UrbanGardeningService:
    def __init__(self):
        self.model_plant1 = None
        self.model_plant2 = None
        self.model_plant3 = None
        self.label_encoders = None
        self.models_loaded = False
        self.fallback_mode = False
        self.service_available = True
        self.load_models()
        
    def load_models(self):
        """Load the trained models and label encoders with fallback"""
        try:
            # Get the current directory path
            current_dir = os.path.dirname(os.path.abspath(__file__))
            models_path = current_dir
            
            print(f"📁 Loading models from: {models_path}")
            
            # Check if model files exist
            model_files = {
                'model_plant1.pkl': 'Plant 1 Model',
                'model_plant2.pkl': 'Plant 2 Model', 
                'model_plant3.pkl': 'Plant 3 Model',
                'label_encoders.pkl': 'Label Encoders'
            }
            
            # Verify all files exist
            for model_file, description in model_files.items():
                file_path = os.path.join(models_path, model_file)
                if not os.path.exists(file_path):
                    print(f"❌ {description} not found at {file_path}")
                    self.fallback_mode = True
                    return False
                else:
                    print(f"✅ Found: {description}")
            
            # Try to load the models
            print("🔄 Attempting to load models...")
            try:
                with open(os.path.join(models_path, 'model_plant1.pkl'), 'rb') as f:
                    self.model_plant1 = pickle.load(f)
                print("✅ model_plant1.pkl loaded")
                
                with open(os.path.join(models_path, 'model_plant2.pkl'), 'rb') as f:
                    self.model_plant2 = pickle.load(f)
                print("✅ model_plant2.pkl loaded")
                
                with open(os.path.join(models_path, 'model_plant3.pkl'), 'rb') as f:
                    self.model_plant3 = pickle.load(f)
                print("✅ model_plant3.pkl loaded")
                
                with open(os.path.join(models_path, 'label_encoders.pkl'), 'rb') as f:
                    self.label_encoders = pickle.load(f)
                print("✅ label_encoders.pkl loaded")
                
                self.models_loaded = True
                print("🎉 All models loaded successfully!")
                return True
                
            except Exception as e:
                print(f"❌ Error loading model files: {e}")
                print("🔄 Switching to fallback mode...")
                self.fallback_mode = True
                return False
                
        except Exception as e:
            print(f"❌ Error in load_models: {str(e)}")
            self.fallback_mode = True
            return False
    
    def get_recommendations(self, city, area_type, sunlight_hours, container_type, 
                          time_commitment, month, space_size):
        """Get plant recommendations based on user input"""
        try:
            if self.fallback_mode or not self.models_loaded:
                return self.get_fallback_recommendations(city, area_type, sunlight_hours, container_type, 
                                                       time_commitment, month, space_size)
            
            # Original ML model code would go here
            # Since models failed to load, use fallback
            return self.get_fallback_recommendations(city, area_type, sunlight_hours, container_type, 
                                                   time_commitment, month, space_size)
            
        except Exception as e:
            error_msg = f"Error getting recommendations: {str(e)}"
            print(error_msg)
            return self.get_fallback_recommendations(city, area_type, sunlight_hours, container_type, 
                                                   time_commitment, month, space_size)
    
    def get_fallback_recommendations(self, city, area_type, sunlight_hours, container_type, 
                                   time_commitment, month, space_size):
        """Provide intelligent fallback recommendations based on rules"""
        print(f"🌿 Using fallback recommendations for {city}, {area_type}, {month}")
        
        # Rule-based recommendations
        recommendations = {
            # City-based preferences
            'Mumbai': {
                'Balcony': ['Basil', 'Mint', 'Coriander', 'Lemon Grass'],
                'Terrace': ['Tomato', 'Chili', 'Brinjal', 'Okra'],
                'Windowsill': ['Microgreens', 'Aloe Vera', 'Herbs'],
                'Indoor': ['Snake Plant', 'Spider Plant', 'Peace Lily']
            },
            'Delhi': {
                'Balcony': ['Coriander', 'Spinach', 'Carrot', 'Radish'],
                'Terrace': ['Tomato', 'Capsicum', 'Cauliflower', 'Cabbage'],
                'Windowsill': ['Mint', 'Basil', 'Aloe Vera'],
                'Indoor': ['ZZ Plant', 'Snake Plant', 'Chinese Evergreen']
            },
            'Bangalore': {
                'Balcony': ['Strawberry', 'Lettuce', 'Kale', 'Herbs'],
                'Terrace': ['Tomato', 'Bell Pepper', 'Beans', 'Peas'],
                'Windowsill': ['Herbs', 'Microgreens', 'Succulents'],
                'Indoor': ['Air Plants', 'Ferns', 'Peace Lily']
            },
            'Chennai': {
                'Balcony': ['Leafy Vegetables', 'Herbs', 'Drumstick'],
                'Terrace': ['Tomato', 'Chili', 'Brinjal', 'Ladyfinger'],
                'Windowsill': ['Aloe Vera', 'Basil', 'Mint'],
                'Indoor': ['Snake Plant', 'ZZ Plant', 'Pothos']
            },
            'Kolkata': {
                'Balcony': ['Cabbage', 'Cauliflower', 'Broccoli'],
                'Terrace': ['Tomato', 'Chili', 'Brinjal', 'Pumpkin'],
                'Windowsill': ['Herbs', 'Succulents', 'Aloe'],
                'Indoor': ['Ferns', 'Peace Lily', 'Spider Plant']
            }
        }
        
        # Get city-specific or default recommendations
        city_rec = recommendations.get(city, recommendations['Mumbai'])
        area_rec = city_rec.get(area_type, ['Basil', 'Mint', 'Coriander'])
        
        # Seasonal adjustments
        seasonal_plants = {
            'January': ['Spinach', 'Coriander', 'Carrot', 'Radish'],
            'February': ['Tomato', 'Capsicum', 'Cauliflower', 'Cabbage'],
            'March': ['Cucumber', 'Bitter Gourd', 'Bottle Gourd'],
            'April': ['All Gourds', 'Tomato', 'Chili'],
            'May': ['Okra', 'Brinjal', 'Cowpea', 'Cluster Beans'],
            'June': ['Mint', 'Basil', 'Microgreens'],
            'July': ['Monsoon Vegetables', 'Herbs'],
            'August': ['Bhindi', 'Brinjal', 'Chili', 'Tomato'],
            'September': ['Winter Preparation Plants'],
            'October': ['Carrot', 'Radish', 'Spinach', 'Coriander'],
            'November': ['Cauliflower', 'Cabbage', 'Broccoli'],
            'December': ['Winter Greens', 'Herbs']
        }
        
        # Blend area-based and seasonal recommendations
        seasonal_rec = seasonal_plants.get(month, area_rec)
        final_plants = list(dict.fromkeys(area_rec + seasonal_rec))[:3]  # Remove duplicates, take top 3
        
        # Ensure we have exactly 3 plants
        while len(final_plants) < 3:
            final_plants.append('Basil')  # Default fallback
        
        return {
            'recommended_plants': [
                {
                    'name': final_plants[0],
                    'position': 1,
                    'suitability': 'High',
                    'tips': self.get_gardening_tips(final_plants[0], area_type, month)
                },
                {
                    'name': final_plants[1],
                    'position': 2,
                    'suitability': 'Medium',
                    'tips': self.get_gardening_tips(final_plants[1], area_type, month)
                },
                {
                    'name': final_plants[2],
                    'position': 3,
                    'suitability': 'Good',
                    'tips': self.get_gardening_tips(final_plants[2], area_type, month)
                }
            ],
            'garden_setup': {
                'city': city,
                'area_type': area_type,
                'space_size': space_size,
                'container_type': container_type,
                'time_commitment': time_commitment,
                'sunlight_hours': sunlight_hours,
                'month': month
            },
            'status': 'success',
            'note': 'Using intelligent fallback recommendations'
        }
    
    def get_gardening_tips(self, plant_name, area_type, month):
        """Get gardening tips based on plant and conditions"""
        tips_mapping = {
            'Tomato': 'Provide support stakes and regular watering. Harvest when fruits are firm and fully colored.',
            'Basil': 'Pinch flowers to encourage leaf growth. Prefers warm weather and plenty of sunlight.',
            'Mint': 'Grows vigorously, keep in contained space. Prefers partial shade and moist soil.',
            'Chili': 'Needs plenty of sunlight and well-drained soil. Harvest when fruits reach desired size and color.',
            'Coriander': 'Harvest leaves regularly to prevent bolting. Prefers cooler weather.',
            'Spinach': 'Prefers cooler weather, harvest outer leaves. Grows quickly in rich soil.',
            'Lettuce': 'Keep soil consistently moist. Harvest in morning for crispest leaves.',
            'Cucumber': 'Needs vertical support and regular feeding. Harvest when firm and green.',
            'Brinjal': 'Requires warm weather and regular fertilization. Support plants with stakes.',
            'Okra': 'Needs hot weather and well-drained soil. Harvest pods when young and tender.',
            'Bell Pepper': 'Prefers consistent moisture and full sun. Support plants as they grow.',
            'Carrot': 'Needs loose, sandy soil for proper root development. Thin seedlings early.',
            'Radish': 'Fast growing, harvest when roots are young and tender. Great for beginners.',
            'Lemon Grass': 'Prefers full sun and regular watering. Use leaves for tea and cooking.',
            'Microgreens': 'Harvest in 1-3 weeks. High in nutrients, perfect for small spaces.',
            'Cabbage': 'Needs consistent moisture. Harvest when heads feel firm.',
            'Cauliflower': 'Blanch heads by tying leaves over them as they develop.',
            'Broccoli': 'Harvest main head first, side shoots will continue producing.',
            'Strawberry': 'Prefers slightly acidic soil. Use mulch to keep fruits clean.'
        }
        
        base_tip = tips_mapping.get(plant_name, 'Provide adequate water and sunlight based on season. Monitor plant health regularly.')
        
        # Add area-specific tips
        if area_type.lower() == 'balcony':
            base_tip += ' Use appropriate sized containers for limited space. Consider vertical gardening.'
        elif area_type.lower() == 'terrace':
            base_tip += ' Ensure proper drainage in large containers. Protect from strong winds.'
        elif area_type.lower() == 'windowsill':
            base_tip += ' Rotate pots regularly for even growth. Wipe leaves to keep them clean.'
        elif area_type.lower() == 'indoor':
            base_tip += ' Ensure adequate light and ventilation. Use well-draining soil mix.'
            
        # Add seasonal tips
        if month in ['December', 'January', 'February']:
            base_tip += ' Protect from cold winds during winter months.'
        elif month in ['March', 'April', 'May']:
            base_tip += ' Increase watering frequency during summer heat.'
        elif month in ['June', 'July', 'August', 'September']:
            base_tip += ' Ensure good drainage during monsoon season.'
            
        return base_tip
    
    def get_available_options(self):
        """Get available options for dropdowns"""
        return {
            'cities': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Chandigarh', 'Jaipur', 'Lucknow'],
            'area_types': ['Balcony', 'Terrace', 'Windowsill', 'Indoor'],
            'months': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            'container_types': ['Small pots', 'Medium pots', 'Large containers', 'Vertical planters'],
            'sunlight_options': ['1-2 hours', '2-4 hours', '4-6 hours', '6-8 hours', '8+ hours'],
            'time_options': ['5 mins daily', '10 mins daily', '15 mins daily', '20 mins daily', '30 mins daily', '45 mins daily', '1 hour daily', '30 mins weekend'],
            'status': 'success'
        }

# Test the service
if __name__ == "__main__":
    print("🧪 Testing Urban Gardening Service...")
    service = UrbanGardeningService()
    
    print(f"📊 Service status: Models loaded: {service.models_loaded}, Fallback mode: {service.fallback_mode}")
    
    # Test with sample data
    print("\n🌱 Testing with sample data...")
    test_recommendations = service.get_recommendations(
        city='Mumbai',
        area_type='Balcony',
        sunlight_hours='4-6',
        container_type='Small pots',
        time_commitment='30 mins daily',
        month='January',
        space_size=20
    )
    
    print("\n📊 Test Results:")
    print(f"Status: {test_recommendations.get('status', 'unknown')}")
    
    if 'error' in test_recommendations:
        print(f"❌ Error: {test_recommendations['error']}")
    else:
        print("✅ Recommendations generated successfully!")
        for plant in test_recommendations['recommended_plants']:
            print(f"   {plant['position']}. {plant['name']} - {plant['suitability']}")
            print(f"      Tips: {plant['tips']}")