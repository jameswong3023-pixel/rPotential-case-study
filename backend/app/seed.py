"""Loads seed UoPs into SQLite on first run if the table is empty."""

import json
from datetime import datetime
from pathlib import Path

from sqlmodel import Session, select

from .db import engine
from .models import UoP

SEED_PATH = Path(__file__).resolve().parent.parent / "seed_uops.json"


def seed_if_empty() -> None:
    with Session(engine) as session:
        existing = session.scalar(select(UoP).limit(1))
        if existing is not None:
            return

        data = json.loads(SEED_PATH.read_text())
        for record in data["uops"]:
            impact = record.get("impact") or {}
            uop = UoP(
                id=record["id"],
                uop_num=record["uop_num"],
                section=record["section"],
                name=record["name"],
                desc=record["desc"],
                back_desc=record.get("back_desc"),
                role=record.get("role"),
                department=record.get("department"),
                value_band=record.get("value_band"),
                archetype=record.get("archetype"),
                readiness=record.get("readiness"),
                impact_nc=impact.get("nc"),
                impact_aug=impact.get("aug"),
                impact_tf=impact.get("tf"),
                impact_rd=impact.get("rd"),
                metrics=record.get("metrics", []),
                sources=record.get("sources", []),
                generated_at=datetime.fromisoformat(
                    record["generated_at"].replace("Z", "+00:00")
                ),
            )
            session.add(uop)
        session.commit()
