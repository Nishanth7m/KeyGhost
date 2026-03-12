from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import User, AuthLog, KeystrokeProfile
from auth import get_current_user
from schemas import DashboardStats

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_stats(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    logs_result = await db.execute(select(AuthLog).where(AuthLog.user_id == current_user.id).order_by(AuthLog.timestamp.desc()))
    logs = logs_result.scalars().all()
    
    total_logins = len([l for l in logs if l.event_type == "MATCH"])
    blocked_attempts = len([l for l in logs if l.event_type == "BLOCKED"])
    last_login = logs[0].timestamp if logs else None
    
    prof_result = await db.execute(select(KeystrokeProfile).where(KeystrokeProfile.user_id == current_user.id))
    profile = prof_result.scalars().first()
    
    return DashboardStats(
        total_logins=total_logins,
        blocked_attempts=blocked_attempts,
        last_login=last_login,
        risk_score=0.12 if blocked_attempts == 0 else 0.85,
        training_status="COMPLETE" if current_user.is_trained else "INCOMPLETE",
        profile_confidence=profile.confidence_threshold if profile else 0.0,
        recent_logs=[{"timestamp": l.timestamp, "event_type": l.event_type, "score": l.biometric_score} for l in logs[:10]]
    )

@router.get("/threat-map")
async def get_threat_map(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    logs_result = await db.execute(select(AuthLog).where(AuthLog.user_id == current_user.id, AuthLog.event_type == "BLOCKED").order_by(AuthLog.timestamp.desc()).limit(30))
    logs = logs_result.scalars().all()
    return [{"timestamp": l.timestamp, "score": l.biometric_score, "details": l.details} for l in logs]

@router.delete("/retrain")
async def retrain(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    current_user.is_trained = False
    current_user.training_samples_count = 0
    await db.commit()
    return {"message": "Profile reset"}
