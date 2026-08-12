from datetime import datetime, timezone
from uuid import uuid4
from typing import Optional, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.schemas import SecurityScanCreate, SecurityScanResponse
from app.services.feature_registry import FEATURE_REGISTRY
from app.api.v1.threats import add_threat_event

router = APIRouter()

_INITIAL_SCANS = [
    {
        "id": "SCAN-9042",
        "scan_type": "Jailbreak & Injection Sweep",
        "target": "gpt-4-turbo-2024",
        "status": "completed",
        "risk_score": 0.03,
        "created_at": datetime.now(timezone.utc),
        "completed_at": datetime.now(timezone.utc),
    },
    {
        "id": "SCAN-9041",
        "scan_type": "Vibe Code Security Audit",
        "target": "claude-3-opus-20240229",
        "status": "completed",
        "risk_score": 0.12,
        "created_at": datetime.now(timezone.utc),
        "completed_at": datetime.now(timezone.utc),
    },
    {
        "id": "SCAN-9040",
        "scan_type": "Model Supply Chain Verification",
        "target": "llama-3-70b-instruct",
        "status": "completed",
        "risk_score": 0.05,
        "created_at": datetime.now(timezone.utc),
        "completed_at": datetime.now(timezone.utc),
    },
]

_memory_scans: list[dict] = list(_INITIAL_SCANS)


def get_scans_store() -> list[dict]:
    return _memory_scans


@router.post("/", response_model=SecurityScanResponse)
async def create_scan(
    scan: SecurityScanCreate,
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    new_scan = {
        "id": f"SCAN-{len(_memory_scans) + 9043}",
        "scan_type": scan.scan_type,
        "target": scan.target,
        "status": "completed",
        "risk_score": 0.02,
        "created_at": now,
        "completed_at": now,
    }
    _memory_scans.insert(0, new_scan)
    return SecurityScanResponse(**new_scan)


@router.post("/run")
async def run_full_scan(payload: dict, db: AsyncSession = Depends(get_db)):
    """Run an automated sweep across multiple security modules."""
    text = payload.get("text", "")
    target = payload.get("target", "All AI Models")
    selected_modules = payload.get("modules", ["jailbreak_injection_protection", "vibe_code_security", "data_loss_prevention"])

    now = datetime.now(timezone.utc)
    results = {}
    max_risk = 0.0
    all_findings = []

    for mod_key in selected_modules:
        if mod_key in FEATURE_REGISTRY:
            func = FEATURE_REGISTRY[mod_key]["function"]
            try:
                res = func({"text": text, "direction": "input"})
                results[mod_key] = res
                risk = res.get("risk_score", 0.0)
                if risk > max_risk:
                    max_risk = risk
                if res.get("findings"):
                    all_findings.extend(res["findings"])
            except Exception as e:
                results[mod_key] = {"error": str(e)}

    status = "completed"
    if max_risk >= 0.7:
        # Trigger automatic threat detection event
        add_threat_event(
            threat_type="Adversarial Scan Threat",
            severity="high",
            source=target,
            description=f"High risk score ({max_risk:.2f}) detected during security sweep: {all_findings[:1]}",
        )
    elif max_risk >= 0.3:
        add_threat_event(
            threat_type="Suspicious Pattern Detected",
            severity="medium",
            source=target,
            description=f"Medium risk score ({max_risk:.2f}) detected: {all_findings[:1]}",
        )

    scan_record = {
        "id": f"SCAN-{len(_memory_scans) + 9043}",
        "scan_type": "Automated Multi-Module Sweep",
        "target": target,
        "status": status,
        "risk_score": round(max_risk, 3),
        "created_at": now,
        "completed_at": now,
    }
    _memory_scans.insert(0, scan_record)

    return {
        "scan": SecurityScanResponse(**scan_record),
        "module_results": results,
        "max_risk_score": round(max_risk, 3),
        "total_findings": len(all_findings),
    }


@router.get("/", response_model=list[SecurityScanResponse])
async def list_scans(db: AsyncSession = Depends(get_db)):
    return [SecurityScanResponse(**s) for s in _memory_scans]


@router.get("/{scan_id}", response_model=SecurityScanResponse)
async def get_scan(scan_id: str, db: AsyncSession = Depends(get_db)):
    for s in _memory_scans:
        if s["id"] == scan_id:
            return SecurityScanResponse(**s)
    raise HTTPException(status_code=404, detail=f"Scan {scan_id} not found")

