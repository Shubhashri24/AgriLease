from database import db
from models import CropRecommendationCreate, UserFeedbackCreate
import json
from datetime import datetime
import uuid

class CropService:
    def __init__(self):
        self.db = db
    
    def generate_session_id(self):
        """Generate unique session ID for each recommendation"""
        return str(uuid.uuid4())
    
    def save_recommendation(self, recommendation_data: CropRecommendationCreate):
        """Save crop recommendation to database"""
        try:
            with self.db.get_connection() as conn:
                cursor = conn.cursor()
                
                query = """
                    INSERT INTO crop_recommendations 
                    (session_id, nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall, recommendations)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                values = (
                    recommendation_data.session_id,
                    recommendation_data.nitrogen,
                    recommendation_data.phosphorus,
                    recommendation_data.potassium,
                    recommendation_data.temperature,
                    recommendation_data.humidity,
                    recommendation_data.ph,
                    recommendation_data.rainfall,
                    json.dumps(recommendation_data.recommendations)
                )
                
                cursor.execute(query, values)
                conn.commit()
                
                # Update popular crops analytics
                self._update_popular_crops(recommendation_data.recommendations)
                
                print(f"✅ Recommendation saved for session: {recommendation_data.session_id}")
                return cursor.lastrowid
                
        except Exception as e:
            print(f"❌ Failed to save recommendation: {e}")
            return None
    
    def save_feedback(self, feedback_data: UserFeedbackCreate):
        """Save user feedback to database"""
        try:
            with self.db.get_connection() as conn:
                cursor = conn.cursor()
                
                query = """
                    INSERT INTO user_feedback 
                    (session_id, crop_name, rating, feedback, is_implemented, yield_improvement)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """
                
                values = (
                    feedback_data.session_id,
                    feedback_data.crop_name,
                    feedback_data.rating,
                    feedback_data.feedback,
                    feedback_data.is_implemented,
                    feedback_data.yield_improvement
                )
                
                cursor.execute(query, values)
                conn.commit()
                print(f"✅ Feedback saved for crop: {feedback_data.crop_name}")
                return cursor.lastrowid
                
        except Exception as e:
            print(f"❌ Failed to save feedback: {e}")
            return None
    
    def _update_popular_crops(self, recommendations):
        """Update popular crops analytics"""
        try:
            with self.db.get_connection() as conn:
                cursor = conn.cursor()
                
                for rec in recommendations:
                    crop_name = rec.get('name', '').lower()
                    if crop_name:
                        # Check if crop exists
                        cursor.execute(
                            "SELECT id FROM popular_crops WHERE crop_name = %s",
                            (crop_name,)
                        )
                        result = cursor.fetchone()
                        
                        if result:
                            # Update existing
                            cursor.execute(
                                "UPDATE popular_crops SET recommendation_count = recommendation_count + 1, last_recommended = %s WHERE crop_name = %s",
                                (datetime.now(), crop_name)
                            )
                        else:
                            # Insert new
                            cursor.execute(
                                "INSERT INTO popular_crops (crop_name, recommendation_count, last_recommended) VALUES (%s, 1, %s)",
                                (crop_name, datetime.now())
                            )
                
                conn.commit()
                
        except Exception as e:
            print(f"❌ Failed to update popular crops: {e}")
    
    def get_recommendation_history(self, session_id: str):
        """Get recommendation history for a session"""
        try:
            with self.db.get_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                
                cursor.execute(
                    "SELECT * FROM crop_recommendations WHERE session_id = %s ORDER BY created_at DESC",
                    (session_id,)
                )
                results = cursor.fetchall()
                
                # Parse JSON recommendations
                for result in results:
                    if result['recommendations']:
                        result['recommendations'] = json.loads(result['recommendations'])
                
                return results
                
        except Exception as e:
            print(f"❌ Failed to get recommendation history: {e}")
            return []
    
    def get_popular_crops(self, limit: int = 10):
        """Get most popular crops"""
        try:
            with self.db.get_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                
                cursor.execute(
                    "SELECT crop_name, recommendation_count, success_rate FROM popular_crops ORDER BY recommendation_count DESC LIMIT %s",
                    (limit,)
                )
                return cursor.fetchall()
                
        except Exception as e:
            print(f"❌ Failed to get popular crops: {e}")
            return []

# Global service instance
crop_service = CropService()