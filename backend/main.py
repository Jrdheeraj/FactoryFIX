from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from contextlib import asynccontextmanager
import pandas as pd
import random
import copy
import asyncio
import os

try:
    from .runtime_state import runtime_state, runtime_lock
    from .control_room_ws import control_room_socket
    from .runtime_updater import runtime_updater
except ImportError:
    from runtime_state import runtime_state, runtime_lock
    from control_room_ws import control_room_socket
    from runtime_updater import runtime_updater


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.runtime_task = asyncio.create_task(runtime_updater())
    try:
        yield
    finally:
        task = getattr(app.state, "runtime_task", None)
        if task:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass


app = FastAPI(
    title="FactoryFix AI - Unified Manufacturing Intelligence",
    version="1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "running"}


# ---------------- HELPER ----------------
def health_factor(status):
    if not status:
        return 1.0
    return {"healthy": 1.0, "warning": 0.85, "critical": 0.6}.get(str(status).lower(), 1.0)


def system_output(steps):
    return min(s["capacity"] for s in steps)


# ================= CSV ANALYSIS =================
@app.post("/factory-analysis/csv")
async def factory_analysis_csv(file: UploadFile = File(...)):
    filename = (file.filename or "").strip()
    lower_name = filename.lower()
    if not lower_name.endswith((".csv", ".xlsx")):
        raise HTTPException(400, "Only CSV or Excel allowed")

    try:
        df = pd.read_csv(file.file) if lower_name.endswith(".csv") else pd.read_excel(file.file)
    except Exception as exc:
        raise HTTPException(400, f"Failed to parse file: {exc}") from exc

    if df.empty:
        raise HTTPException(400, "Empty file")

    required_columns = {"process_step", "base_capacity_per_day"}
    missing_columns = sorted(required_columns - set(df.columns))
    if missing_columns:
        raise HTTPException(
            400,
            f"Missing required columns: {', '.join(missing_columns)}",
        )

    # Coerce analysis columns early so invalid data returns clear 400s instead of 500s.
    step_series = pd.to_numeric(df["process_step"], errors="coerce")
    cap_series = pd.to_numeric(df["base_capacity_per_day"], errors="coerce")
    invalid_mask = step_series.isna() | cap_series.isna()
    if invalid_mask.any():
        bad_rows = [int(i) + 2 for i in invalid_mask[invalid_mask].index[:5]]
        raise HTTPException(
            400,
            f"Invalid numeric values in process_step/base_capacity_per_day at CSV rows: {bad_rows}",
        )

    df["process_step"] = step_series.astype(int)
    df["base_capacity_per_day"] = cap_series.astype(float)

    # ---------------- MACHINE HEALTH ----------------
    machines = []
    for i in range(len(df)):
        risk = random.randint(5, 95)
        status = "healthy" if risk < 40 else "warning" if risk < 70 else "critical"
        machines.append({
            "machine_id": f"M-{i+1:04}",
            "machine_name": f"Machine Unit {i+1}",
            "status": status,
            "risk_score": risk,
            "temperature": random.randint(60, 95),
            "vibration": round(random.uniform(0.2, 1.8), 2),
            "runtime_hours": random.randint(1000, 10000),
            "defect_probability": round(random.uniform(0.01, 0.8), 3),
        })

    healthy = sum(m["status"] == "healthy" for m in machines)
    warning = sum(m["status"] == "warning" for m in machines)
    critical = sum(m["status"] == "critical" for m in machines)

    factory_health = {
        "total_records": len(machines),
        "healthy_count": healthy,
        "warning_count": warning,
        "critical_count": critical,
        "overall_health_score": round((healthy / len(machines)) * 100, 1),
        "machines": machines,
    }

    # ---------------- UPDATE LIVE RUNTIME STATE ----------------
    async with runtime_lock:
        runtime_state["machines"] = len(machines)
        runtime_state["anomalies"] = critical
        runtime_state["failureRisk"] = round(
            sum(m["risk_score"] for m in machines) / len(machines)
        )
        runtime_state["defectRisk"] = round(
            sum(m["defect_probability"] * 100 for m in machines) / len(machines)
        )
        runtime_state["optimizationScore"] = random.randint(70, 95)
        runtime_state["last_update"] = datetime.utcnow().isoformat()

    # ---------------- LINE CAPACITY MODEL ----------------
    step_map = {}
    for _, row in df.iterrows():
        step = row["process_step"]
        cap = row["base_capacity_per_day"] * health_factor(row.get("health_status"))
        step_map.setdefault(step, {"process_step": step, "machines": 0, "capacity": 0.0})
        step_map[step]["machines"] += 1
        step_map[step]["capacity"] += cap

    steps_before = list(step_map.values())
    if not steps_before:
        raise HTTPException(400, "No valid process steps found for optimization")
    optimized_steps = copy.deepcopy(steps_before)

    current_output = system_output(steps_before)

    # ================= PHASE 1: LINE BALANCING =================
    avg_capacity = sum(s["capacity"] for s in optimized_steps) / len(optimized_steps)

    for step in optimized_steps:
        if step["capacity"] > avg_capacity * 1.1:
            transferable = (step["capacity"] - avg_capacity) * 0.2
            step["capacity"] -= transferable
            min(optimized_steps, key=lambda x: x["capacity"])["capacity"] += transferable

    # ================= PHASE 2: BOTTLENECK EXPANSION =================
    max_new_machines = 2
    machines_added = 0
    optimization_actions = []

    while machines_added < max_new_machines:
        bottleneck = min(optimized_steps, key=lambda x: x["capacity"])
        per_machine_gain = bottleneck["capacity"] / bottleneck["machines"]

        bottleneck["machines"] += 1
        bottleneck["capacity"] += per_machine_gain
        machines_added += 1

        optimization_actions.append({
            "process_step": bottleneck["process_step"],
            "action": "Added machine at bottleneck (space constrained optimization)"
        })

        if system_output(optimized_steps) >= avg_capacity * 0.95:
            break

    optimized_output = system_output(optimized_steps)

    bottleneck_before = min(steps_before, key=lambda x: x["capacity"])
    bottleneck_after = min(optimized_steps, key=lambda x: x["capacity"])

    return {
        "success": True,
        "factory_health": factory_health,
        "manufacturing_line_optimization": {
            "current_output": round(current_output),
            "optimized_output": round(optimized_output),
            "improvement_percent": 0.0
            if current_output == 0
            else round(
                ((optimized_output - current_output) / current_output) * 100, 1
            ),
            "before_optimization": {
                "bottleneck_step": bottleneck_before["process_step"],
                "steps": [{**s, "capacity": round(s["capacity"])} for s in steps_before],
            },
            "after_optimization": {
                "bottleneck_step": bottleneck_after["process_step"],
                "steps": [{**s, "capacity": round(s["capacity"])} for s in optimized_steps],
            },
            "optimization_actions": optimization_actions,
            "machine_limit_respected": machines_added <= max_new_machines,
        },
        "analysis_timestamp": datetime.utcnow().isoformat(),
    }


# ================= WEBSOCKET =================
@app.websocket("/ws/control-room")
async def control_room(websocket: WebSocket):
    await control_room_socket(websocket)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8001")),
        reload=False,
    )
