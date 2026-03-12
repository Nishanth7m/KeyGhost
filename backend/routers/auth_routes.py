from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import json
from datetime import datetime

from database import get_db
from models import User, KeystrokeProfile, AuthLog
from schemas import UserCreate, LoginRequest, TrainingSampleRequest, UserResponse, Token
from auth import hash_password, verify_password, create_access_token, get_current_user
from keystroke_analyzer import KeystrokeAnalyzer

router = APIRouter()
analyzer = KeystrokeAnalyzer()

@router.post("/register", response_model=dict)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where((User.username == user.username) | (User.email == user.email)))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {"user_id": new_user.id, "username": new_user.username, "message": "Account created. Please complete biometric training."}

@router.post("/login", response_model=Token)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == req.username))
    user = result.scalars().first()
    
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    if not user.is_trained:
        # Collect sample
        user.training_samples_count += 1
        await db.commit()
        return Token(
            access_token=create_access_token(data={"sub": user.username}),
            token_type="bearer",
            status="TRAINING_REQUIRED",
            samples_remaining=max(0, 5 - user.training_samples_count)
        )
    
    # User is trained, verify biometrics
    prof_result = await db.execute(select(KeystrokeProfile).where(KeystrokeProfile.user_id == user.id))
    profile = prof_result.scalars().first()
    
    if not profile:
        raise HTTPException(status_code=500, detail="Profile missing")
    
    live_features = analyzer.extract_features([e.dict() for e in req.keystroke_events])
    score, verdict = analyzer.compare({
        "mean_dwell_times": profile.mean_dwell_times,
        "mean_flight_times": profile.mean_flight_times,
        "std_dwell_times": profile.std_dwell_times,
        "std_flight_times": profile.std_flight_times,
        "mean_typing_speed": profile.mean_typing_speed,
        "mean_rhythm_score": profile.mean_rhythm_score,
        "confidence_threshold": profile.confidence_threshold
    }, live_features)
    
    log = AuthLog(
        user_id=user.id,
        ip_address=req.client_info.ip if req.client_info else None,
        event_type=verdict,
        biometric_score=score,
        confidence=profile.confidence_threshold,
        details=json.dumps(analyzer.detect_anomaly({"mean_dwell_times": profile.mean_dwell_times}, live_features))
    )
    db.add(log)
    await db.commit()
    
    if verdict == "MATCH":
        return Token(access_token=create_access_token(data={"sub": user.username}), token_type="bearer", status="MATCH")
    elif verdict == "UNCERTAIN":
        return Token(access_token=create_access_token(data={"sub": user.username}), token_type="bearer", status="UNCERTAIN", requires_mfa=True)
    else:
        raise HTTPException(status_code=403, detail={"message": "Biometric mismatch", "score": score, "threshold": profile.confidence_threshold, "anomaly": log.details})

@router.post("/training-sample")
async def training_sample(req: TrainingSampleRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.is_trained:
        return {"message": "Already trained"}
    
    current_user.training_samples_count += 1
    
    # In a real app, we'd store the raw samples temporarily. For hackathon, we'll just simulate building it on the 5th.
    if current_user.training_samples_count >= 5:
        current_user.is_trained = True
        
        # Create a dummy profile for the hackathon based on the last sample
        f = analyzer.extract_features([e.dict() for e in req.keystroke_events])
        mean_dwell = float(sum(f["dwell_times"])/len(f["dwell_times"])) if f["dwell_times"] else 100.0
        mean_flight = float(sum(f["flight_times"])/len(f["flight_times"])) if f["flight_times"] else 100.0
        
        profile = KeystrokeProfile(
            user_id=current_user.id,
            mean_dwell_times=json.dumps([mean_dwell]),
            mean_flight_times=json.dumps([mean_flight]),
            std_dwell_times=json.dumps([10.0]),
            std_flight_times=json.dumps([10.0]),
            mean_typing_speed=f["typing_speed"],
            mean_rhythm_score=f["rhythm_score"],
            training_samples=5,
            confidence_threshold=0.65
        )
        db.add(profile)
        
    await db.commit()
    return {"samples_collected": current_user.training_samples_count, "samples_needed": 5, "is_complete": current_user.is_trained}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
