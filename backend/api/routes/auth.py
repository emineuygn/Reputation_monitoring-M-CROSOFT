from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.schemas import UserCreate, UserLogin, UserOut, Token
from auth.deps import get_current_user
from auth.security import hash_password, verify_password, create_access_token
from db.database import get_db
from db.models import User

router = APIRouter()


@router.post("/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta ile zaten bir hesap var.")

    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Şifre en az 8 karakter olmalı.")

    user = User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        ad_soyad=payload.ad_soyad,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.post("/auth/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı.")

    token = create_access_token(user.id)
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.get("/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
