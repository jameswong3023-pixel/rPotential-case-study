"""Loads seed UoPs into SQLite on first run if the table is empty.

The pipeline output is intentionally messy; this module is where it gets
cleaned up so the API serves consistent data: department labels are
normalized (raw label kept), value bands are parsed into numeric bounds,
and inconsistent records are flagged rather than silently corrected.
"""

import json
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

from sqlmodel import Session, select

from .db import engine
from .models import UoP

SEED_PATH = Path(__file__).resolve().parent.parent / "seed_uops.json"

# Known aliases from the generation pipeline, keyed by casefolded label.
# Unknown labels pass through trimmed rather than being dropped.
DEPARTMENT_ALIASES = {
    "it": "IT",
    "information technology": "IT",
    "supply chain": "Supply Chain",
    "supply chain ops": "Supply Chain",
    "ap / finance": "Finance",
    "finance": "Finance",
    "customer care": "Customer Care",
    "entire business": "Enterprise-wide",
}

VALUE_BAND_RE = re.compile(
    r"\$\s*(\d+(?:\.\d+)?)\s*[–—-]\s*(\d+(?:\.\d+)?)\s*([MK])", re.IGNORECASE
)


def normalize_department(raw: Optional[str]) -> Optional[str]:
    if raw is None:
        return None
    label = raw.strip()
    return DEPARTMENT_ALIASES.get(label.casefold(), label)


def parse_value_band(band: Optional[str]) -> tuple[Optional[float], Optional[float]]:
    """Parse a pipeline value band like "$1.2–2.1M" into ($M low, $M high)."""
    if not band:
        return None, None
    match = VALUE_BAND_RE.search(band)
    if not match:
        return None, None
    low, high = float(match.group(1)), float(match.group(2))
    if match.group(3).upper() == "K":
        low, high = low / 1000, high / 1000
    return low, high


def detect_data_flags(record: dict, impact: dict) -> list[str]:
    flags = []
    impact_values = [impact.get(k) for k in ("nc", "aug", "tf", "rd")]
    if all(v is not None for v in impact_values):
        total = sum(impact_values)
        if total != 100:
            flags.append(
                f"Workforce impact percentages sum to {total}%, not 100% — "
                "treat the distribution as approximate."
            )
    if record.get("value_band") and parse_value_band(record["value_band"]) == (None, None):
        flags.append(f"Value band \"{record['value_band']}\" could not be parsed.")
    return flags


def seed_if_empty() -> None:
    with Session(engine) as session:
        existing = session.scalar(select(UoP).limit(1))
        if existing is not None:
            return

        data = json.loads(SEED_PATH.read_text(encoding="utf-8"))
        for record in data["uops"]:
            impact = record.get("impact") or {}
            value_low, value_high = parse_value_band(record.get("value_band"))
            uop = UoP(
                id=record["id"],
                uop_num=record["uop_num"],
                section=record["section"],
                name=record["name"],
                desc=record["desc"],
                back_desc=record.get("back_desc"),
                role=record.get("role"),
                department=record.get("department"),
                department_norm=normalize_department(record.get("department")),
                value_band=record.get("value_band"),
                value_low=value_low,
                value_high=value_high,
                archetype=record.get("archetype"),
                readiness=record.get("readiness"),
                impact_nc=impact.get("nc"),
                impact_aug=impact.get("aug"),
                impact_tf=impact.get("tf"),
                impact_rd=impact.get("rd"),
                metrics=record.get("metrics", []),
                sources=record.get("sources", []),
                data_flags=detect_data_flags(record, impact),
                generated_at=datetime.fromisoformat(
                    record["generated_at"].replace("Z", "+00:00")
                ),
            )
            session.add(uop)
        session.commit()
