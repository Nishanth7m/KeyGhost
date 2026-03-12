from pydantic import BaseModel, EmailStr
from typing import List, Dict, Optional, Any
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class KeystrokeEvent(BaseModel):
    key: str
    type: str
    timestamp: float

class ClientInfo(BaseModel):
    ip: Optional[str] = None
    user_agent: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str
    keystroke_events: List[KeystrokeEvent]
    client_info: Optional[ClientInfo] = None

class TrainingSampleRequest(BaseModel):
    keystroke_events: List[KeystrokeEvent]

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_trained: bool
    training_samples_count: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    status: Optional[str] = None
    samples_remaining: Optional[int] = None
    requires_mfa: Optional[bool] = None

class DashboardStats(BaseModel):
    total_logins: int
    blocked_attempts: int
    last_login: Optional[datetime]
    risk_score: float
    training_status: str
    profile_confidence: float
    recent_logs: List[Dict[str, Any]]
