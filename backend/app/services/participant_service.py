"""
VPT Sense AI - Participant & QST Session Management Service
"""

import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.vpt_domain import Participant, VPTSession, VPTMeasurement, VPTAlert, DeviceConfig
from backend.app.services.vpt_estimation_service import vpt_estimation_service, VPTEstimationInput


class ParticipantService:

    @staticmethod
    async def create_participant(db: AsyncSession, data: Dict[str, Any]) -> Participant:
        height = float(data.get("height_cm", 165.0))
        weight = float(data.get("weight_kg", 68.0))
        bmi = round(weight / ((height / 100.0) ** 2), 1)

        p = Participant(
            subject_code=data.get("subject_code") or f"SUB-{uuid.uuid4().hex[:5].upper()}",
            full_name=data["full_name"],
            age=int(data["age"]),
            gender=data.get("gender", "FEMALE").upper(),
            height_cm=height,
            weight_kg=weight,
            bmi=bmi,
            clinical_group=data.get("clinical_group", "DIABETIC_NON_NEUROPATHIC"),
            diabetes_duration_years=float(data.get("diabetes_duration_years", 0.0)),
            foot_ulcer_history=bool(data.get("foot_ulcer_history", False)),
            symptoms_nss_score=int(data.get("symptoms_nss_score", 0)),
            notes=data.get("notes", ""),
        )
        db.add(p)
        await db.flush()
        return p

    @staticmethod
    async def list_participants(db: AsyncSession, search: Optional[str] = None, group: Optional[str] = None) -> List[Dict[str, Any]]:
        query = select(Participant).order_by(desc(Participant.created_at))
        if group and group != "ALL":
            query = query.where(Participant.clinical_group == group)
        
        result = await db.execute(query)
        participants = result.scalars().all()

        output = []
        for p in participants:
            if search and search.lower() not in p.full_name.lower() and search.lower() not in p.subject_code.lower():
                continue

            # Fetch latest session for summary
            sess_q = select(VPTSession).where(VPTSession.participant_id == p.id).order_by(desc(VPTSession.tested_at)).limit(1)
            sess_res = await db.execute(sess_q)
            latest_sess = sess_res.scalars().first()

            count_q = select(func.count(VPTSession.id)).where(VPTSession.participant_id == p.id)
            count_res = await db.execute(count_q)
            sessions_count = count_res.scalar() or 0

            output.append({
                "id": p.id,
                "subject_code": p.subject_code,
                "full_name": p.full_name,
                "age": p.age,
                "gender": p.gender,
                "height_cm": p.height_cm,
                "weight_kg": p.weight_kg,
                "bmi": p.bmi,
                "clinical_group": p.clinical_group,
                "diabetes_duration_years": p.diabetes_duration_years,
                "foot_ulcer_history": p.foot_ulcer_history,
                "symptoms_nss_score": p.symptoms_nss_score,
                "latest_vpt_voltage": latest_sess.mean_great_toe_v if latest_sess else None,
                "latest_classification": latest_sess.overall_classification if latest_sess else "NOT_TESTED",
                "ulcer_risk_category": latest_sess.ulcer_risk_category if latest_sess else "LOW",
                "sessions_count": sessions_count,
                "created_at": p.created_at.isoformat() + "Z",
            })
        return output

    @staticmethod
    async def get_participant_detail(db: AsyncSession, participant_id: str) -> Optional[Dict[str, Any]]:
        p_q = select(Participant).where(Participant.id == participant_id)
        p_res = await db.execute(p_q)
        p = p_res.scalars().first()
        if not p:
            return None

        # Sessions with measurements
        sess_q = select(VPTSession).where(VPTSession.participant_id == p.id).order_by(desc(VPTSession.tested_at))
        sess_res = await db.execute(sess_q)
        sessions = sess_res.scalars().all()

        sessions_data = []
        for s in sessions:
            meas_q = select(VPTMeasurement).where(VPTMeasurement.session_id == s.id)
            meas_res = await db.execute(meas_q)
            measurements = meas_res.scalars().all()

            sessions_data.append({
                "id": s.id,
                "tested_at": s.tested_at.isoformat() + "Z",
                "device_name": s.device_name,
                "frequency_hz": s.frequency_hz,
                "mean_great_toe_v": s.mean_great_toe_v,
                "max_site_voltage_v": s.max_site_voltage_v,
                "bilateral_asymmetry_v": s.bilateral_asymmetry_v,
                "overall_classification": s.overall_classification,
                "ulcer_risk_category": s.ulcer_risk_category,
                "clinical_summary": s.clinical_summary,
                "measurements": [
                    {
                        "site": m.anatomical_site,
                        "trial_1_v": m.trial_1_v,
                        "trial_2_v": m.trial_2_v,
                        "trial_3_v": m.trial_3_v,
                        "mean_vpt_v": m.mean_vpt_v,
                        "sd_vpt_v": m.sd_vpt_v,
                        "normative_expected_v": m.normative_expected_v,
                        "z_score": m.z_score,
                        "percentile": m.percentile,
                        "loss_grade": m.loss_grade,
                    }
                    for m in measurements
                ]
            })

        return {
            "id": p.id,
            "subject_code": p.subject_code,
            "full_name": p.full_name,
            "age": p.age,
            "gender": p.gender,
            "height_cm": p.height_cm,
            "weight_kg": p.weight_kg,
            "bmi": p.bmi,
            "clinical_group": p.clinical_group,
            "diabetes_duration_years": p.diabetes_duration_years,
            "foot_ulcer_history": p.foot_ulcer_history,
            "symptoms_nss_score": p.symptoms_nss_score,
            "notes": p.notes,
            "sessions": sessions_data,
        }

    @staticmethod
    async def record_qst_session(db: AsyncSession, participant_id: str, payload: Dict[str, Any]) -> VPTSession:
        p_q = select(Participant).where(Participant.id == participant_id)
        p_res = await db.execute(p_q)
        participant = p_res.scalars().first()
        if not participant:
            raise ValueError(f"Participant with ID {participant_id} not found.")

        measurements_raw = payload.get("measurements", [])
        
        # Calculate summary metrics
        great_toe_voltages = []
        all_voltages = []
        left_toe_v = None
        right_toe_v = None

        meas_objects = []
        for m in measurements_raw:
            site = m["site"]
            t1 = float(m["trial_1_v"])
            t2 = float(m["trial_2_v"])
            t3 = float(m["trial_3_v"])
            mean_v = round((t1 + t2 + t3) / 3.0, 1)
            sd_v = round(float((((t1 - mean_v)**2 + (t2 - mean_v)**2 + (t3 - mean_v)**2) / 2.0) ** 0.5), 2)
            
            all_voltages.append(mean_v)
            if "GREAT_TOE" in site:
                great_toe_voltages.append(mean_v)
                if "LEFT" in site:
                    left_toe_v = mean_v
                elif "RIGHT" in site:
                    right_toe_v = mean_v

            # Estimate normative baseline for this site
            ref_calc = vpt_estimation_service.estimate_reference(VPTEstimationInput(
                age=participant.age,
                gender=participant.gender,
                height_cm=participant.height_cm,
                weight_kg=participant.weight_kg,
                anatomical_site=site,
                measured_vpt_v=mean_v
            ))

            meas_obj = VPTMeasurement(
                anatomical_site=site,
                trial_1_v=t1,
                trial_2_v=t2,
                trial_3_v=t3,
                mean_vpt_v=mean_v,
                sd_vpt_v=sd_v,
                normative_expected_v=ref_calc.expected_mean_vpt_v,
                z_score=ref_calc.z_score or 0.0,
                percentile=ref_calc.percentile_rank or 50.0,
                loss_grade=ref_calc.sensory_classification,
            )
            meas_objects.append(meas_obj)

        mean_gt = round(sum(great_toe_voltages) / len(great_toe_voltages), 1) if great_toe_voltages else (round(sum(all_voltages)/len(all_voltages), 1) if all_voltages else 12.0)
        max_v = max(all_voltages) if all_voltages else mean_gt
        asymmetry = round(abs((left_toe_v or mean_gt) - (right_toe_v or mean_gt)), 1)

        # Classification
        if max_v < 15.0:
            classification = "PRESERVED"
            ulcer_risk = "LOW"
        elif max_v < 20.0:
            classification = "MILD_BLUNTING"
            ulcer_risk = "MODERATE"
        elif max_v < 25.0:
            classification = "MODERATE_NEUROPATHY"
            ulcer_risk = "HIGH"
        else:
            classification = "SEVERE_LOPS"
            ulcer_risk = "CRITICAL"

        session = VPTSession(
            participant_id=participant.id,
            device_name=payload.get("device_name", "Digital Biothesiometer Pro-V"),
            frequency_hz=int(payload.get("frequency_hz", 100)),
            ramp_rate_v_per_sec=float(payload.get("ramp_rate_v_per_sec", 1.0)),
            protocol_name=payload.get("protocol_name", "Standard 6-Point Bilateral QST"),
            mean_great_toe_v=mean_gt,
            max_site_voltage_v=max_v,
            bilateral_asymmetry_v=asymmetry,
            overall_classification=classification,
            ulcer_risk_category=ulcer_risk,
            clinical_summary=payload.get("clinical_summary", f"QST completed across {len(meas_objects)} sites. Max VPT is {max_v} V with {asymmetry} V bilateral asymmetry."),
            measurements=meas_objects,
        )
        db.add(session)

        # Check for critical alerts
        if max_v >= 25.0:
            alert = VPTAlert(
                participant_id=participant.id,
                alert_level="CRITICAL",
                alert_type="SEVERE_LOPS",
                metric_value=max_v,
                site="Bilateral Lower Extremity",
                message=f"CRITICAL: Severe Loss of Protective Sensation (VPT {max_v:.1f} V >= 25.0 V). Marked 7.8x foot ulceration risk."
            )
            db.add(alert)
        elif asymmetry >= 5.0:
            alert = VPTAlert(
                participant_id=participant.id,
                alert_level="WARNING",
                alert_type="BILATERAL_ASYMMETRY",
                metric_value=asymmetry,
                site="Hallux L vs R",
                message=f"Significant bilateral sensory disparity ({asymmetry:.1f} V > 5.0 V). Suspect focal mononeuropathy or asymmetric radiculopathy."
            )
            db.add(alert)

        await db.commit()
        await db.refresh(session)
        return session


participant_service = ParticipantService()
