from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_trained = Column(Boolean, default=False)
    training_samples_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    profile = relationship("KeystrokeProfile", back_populates="user", uselist=False)
    logs = relationship("AuthLog", back_populates="user")

class KeystrokeProfile(Base):
    __tablename__ = "keystroke_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    mean_dwell_times = Column(String, nullable=False)
    mean_flight_times = Column(String, nullable=False)
    std_dwell_times = Column(String, nullable=False)
    std_flight_times = Column(String, nullable=False)
    mean_typing_speed = Column(Float, nullable=False)
    mean_rhythm_score = Column(Float, nullable=False)
    training_samples = Column(Integer, default=0)
    confidence_threshold = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

class AuthLog(Base):
    __tablename__ = "auth_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String, nullable=True)
    event_type = Column(String, nullable=False)
    biometric_score = Column(Float, nullable=True)
    confidence = Column(Float, nullable=True)
    details = Column(String, nullable=True)

    user = relationship("User", back_populates="logs")
