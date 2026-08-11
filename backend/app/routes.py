from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from .db import get_session
from .models import UoP

router = APIRouter()


@router.get("/uops", response_model=list[UoP])
def list_uops(
    section: Optional[str] = None,
    scope: Optional[str] = None,
    session: Session = Depends(get_session),
) -> list[UoP]:
    statement = select(UoP)
    if section:
        statement = statement.where(UoP.section == section)
    if scope:
        statement = select(UoP).where(UoP.department == scope)
    return list(session.scalars(statement).all())


@router.get("/uops/{uop_id}", response_model=UoP)
def get_uop(uop_id: str, session: Session = Depends(get_session)) -> UoP:
    uop = session.get(UoP, uop_id)
    if not uop:
        raise HTTPException(status_code=404, detail="UoP not found")
    return uop


@router.post("/uops/{uop_id}/review", response_model=UoP)
def mark_reviewed(uop_id: str, session: Session = Depends(get_session)) -> UoP:
    uop = session.get(UoP, uop_id)
    if not uop:
        raise HTTPException(status_code=404, detail="UoP not found")
    uop.reviewed = True
    uop.reviewed_at = datetime.utcnow()
    session.add(uop)
    session.commit()
    session.refresh(uop)
    return uop
