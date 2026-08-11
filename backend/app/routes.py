from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, col, select

from .db import get_session
from .models import UoP

router = APIRouter()

SHORTLIST_LIMIT = 3


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
        # Filter on the normalized label so pipeline variants like
        # "supply chain ops" and "Supply Chain" match together.
        statement = statement.where(UoP.department_norm == scope)
    return list(session.scalars(statement).all())


@router.get("/departments", response_model=list[str])
def list_departments(session: Session = Depends(get_session)) -> list[str]:
    """Distinct normalized department labels, for driving filter UI."""
    statement = (
        select(UoP.department_norm)
        .where(col(UoP.department_norm).is_not(None))
        .distinct()
    )
    return sorted(session.scalars(statement).all())


@router.get("/uops/{uop_id}", response_model=UoP)
def get_uop(uop_id: str, session: Session = Depends(get_session)) -> UoP:
    uop = session.get(UoP, uop_id)
    if not uop:
        raise HTTPException(status_code=404, detail="UoP not found")
    return uop


@router.post("/uops/{uop_id}/review", response_model=UoP)
def toggle_reviewed(uop_id: str, session: Session = Depends(get_session)) -> UoP:
    uop = session.get(UoP, uop_id)
    if not uop:
        raise HTTPException(status_code=404, detail="UoP not found")
    uop.reviewed = not uop.reviewed
    uop.reviewed_at = datetime.now(timezone.utc) if uop.reviewed else None
    session.add(uop)
    session.commit()
    session.refresh(uop)
    return uop


@router.post("/uops/{uop_id}/shortlist", response_model=UoP)
def toggle_shortlisted(uop_id: str, session: Session = Depends(get_session)) -> UoP:
    uop = session.get(UoP, uop_id)
    if not uop:
        raise HTTPException(status_code=404, detail="UoP not found")
    if not uop.shortlisted:
        shortlisted_count = len(
            session.scalars(select(UoP).where(col(UoP.shortlisted).is_(True))).all()
        )
        if shortlisted_count >= SHORTLIST_LIMIT:
            raise HTTPException(
                status_code=409,
                detail=f"Shortlist is limited to {SHORTLIST_LIMIT} UoPs. "
                "Remove one before adding another.",
            )
    uop.shortlisted = not uop.shortlisted
    session.add(uop)
    session.commit()
    session.refresh(uop)
    return uop
