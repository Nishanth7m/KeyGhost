from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models import User
from auth import get_current_user

router = APIRouter()

@router.get("/")
async def get_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"username": current_user.username, "email": current_user.email, "is_trained": current_user.is_trained}

@router.post("/retrain")
async def retrain_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    current_user.is_trained = False
    current_user.training_samples_count = 0
    await db.commit()
    return {"message": "Profile reset. Please retrain."}
