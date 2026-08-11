from datetime import datetime
from typing import Optional

from sqlalchemy import Column
from sqlalchemy.types import JSON
from sqlmodel import Field, SQLModel


class UoP(SQLModel, table=True):
    """A Unit of Potential — an AI-generated opportunity for one company to
    redeploy human capacity or apply AI. The library holds a single company's
    portfolio, generated across density levels (section)."""

    __tablename__ = "uops"

    id: str = Field(primary_key=True)
    uop_num: int
    # Density level of the generation pass: role / function / department /
    # board / enterprise. The library groups by this.
    section: str
    name: str
    desc: str
    # One level deeper than desc — shown wherever the user drills in.
    back_desc: Optional[str] = None
    # The role that would own this UoP ("Trust & Safety Lead").
    role: Optional[str] = None
    # Free-form part-of-business label from the generation pipeline ("Supply
    # Chain", "AP / Finance", "Entire business"). Not normalized. Null when
    # the pipeline couldn't classify.
    department: Optional[str] = None
    # Canonical department label derived from `department` at seed time.
    # Filtering and grouping should use this; `department` is kept as the
    # raw pipeline output.
    department_norm: Optional[str] = None
    # Annualized value band, pre-formatted by the pipeline ("$1.2–2.1M").
    # Null when the primary value model is strategic (no dollar band).
    value_band: Optional[str] = None
    # Numeric bounds parsed from value_band at seed time, in $M. Null when
    # the band is missing or unparseable. Ranking uses these.
    value_low: Optional[float] = None
    value_high: Optional[float] = None
    archetype: Optional[str] = None  # capacity / growth / risk
    readiness: Optional[int] = None  # 0-100, null when org not yet assessed
    # Workforce impact distribution, percentages: no_change / augment /
    # transform / redeploy. Null when the workforce pass hasn't run.
    impact_nc: Optional[int] = None
    impact_aug: Optional[int] = None
    impact_tf: Optional[int] = None
    impact_rd: Optional[int] = None
    metrics: list = Field(default_factory=list, sa_column=Column(JSON))
    sources: list = Field(default_factory=list, sa_column=Column(JSON))
    # Human-readable data-quality caveats detected at seed time (e.g. a
    # workforce impact distribution that doesn't sum to 100). Surfaced in
    # the UI rather than silently corrected.
    data_flags: list = Field(default_factory=list, sa_column=Column(JSON))
    generated_at: datetime
    reviewed: bool = False
    reviewed_at: Optional[datetime] = None
    # Pinned to the board shortlist (max 3, enforced by the API).
    shortlisted: bool = False
