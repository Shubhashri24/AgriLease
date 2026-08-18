from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class CropRecommendationCreate(BaseModel):
    session_id: str
    nitrogen: int
    phosphorus: int
    potassium: int
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    recommendations: List[Dict]

class UserFeedbackCreate(BaseModel):
    session_id: str
    crop_name: str
    rating: int
    feedback: Optional[str] = None
    is_implemented: Optional[bool] = False
    yield_improvement: Optional[float] = None

class CropRecommendationResponse(BaseModel):
    id: int
    session_id: str
    nitrogen: int
    phosphorus: int
    potassium: int
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    recommendations: List[Dict]
    created_at: datetime

    class Config:
        from_attributes = True