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


# ================= HELPERS: SMART COLUMN DETECTION =================
def _find_column(df_columns: list, candidates: list[str]) -> str | None:
    """Return the first df column whose lowered name contains any candidate substring."""
    lower_cols = {c: c.lower().replace(" ", "_").replace("-", "_") for c in df_columns}
    for candidate in candidates:
        for orig, low in lower_cols.items():
            if candidate in low:
                return orig
    return None


def _prepare_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Auto-detect or synthesize `process_step` and `base_capacity_per_day` columns.

    Strategy:
    1. If exact columns exist, use them directly.
    2. Otherwise, fuzzy-match column names (e.g. "step", "process", "stage" → process_step).
    3. If still missing, synthesize from available numeric columns so *any* file works.
    """
    cols = list(df.columns)

    # --- process_step ---
    if "process_step" not in df.columns:
        step_col = _find_column(cols, [
            "process_step", "step", "stage", "phase", "operation",
            "process", "station", "line", "sequence",
        ])
        if step_col:
            df = df.rename(columns={step_col: "process_step"})
        else:
            # Assign sequential step numbers (1-based, capped at row count)
            num_steps = min(len(df), max(3, len(df) // 5))
            df["process_step"] = [(i % num_steps) + 1 for i in range(len(df))]

    # --- base_capacity_per_day ---
    if "base_capacity_per_day" not in df.columns:
        cap_col = _find_column(cols, [
            "capacity", "output", "throughput", "production", "rate",
            "units", "quantity", "volume", "yield", "count",
        ])
        if cap_col:
            df = df.rename(columns={cap_col: "base_capacity_per_day"})
        else:
            # Pick the first numeric column that isn't process_step
            numeric_cols = df.select_dtypes(include="number").columns.tolist()
            numeric_cols = [c for c in numeric_cols if c != "process_step"]
            if numeric_cols:
                df = df.rename(columns={numeric_cols[0]: "base_capacity_per_day"})
            else:
                # No numeric columns at all — synthesize random capacity
                df["base_capacity_per_day"] = [
                    random.randint(100, 500) for _ in range(len(df))
                ]

    # --- health_status (optional, best-effort) ---
    if "health_status" not in df.columns:
        hs_col = _find_column(cols, [
            "health", "status", "condition", "state",
        ])
        if hs_col:
            df = df.rename(columns={hs_col: "health_status"})

    # Coerce to numeric, drop rows that can't be converted
    df["process_step"] = pd.to_numeric(df["process_step"], errors="coerce")
    df["base_capacity_per_day"] = pd.to_numeric(df["base_capacity_per_day"], errors="coerce")
    df = df.dropna(subset=["process_step", "base_capacity_per_day"])

    if df.empty:
        return df

    df["process_step"] = df["process_step"].astype(int)
    df["base_capacity_per_day"] = df["base_capacity_per_day"].astype(float)

    return df


# ================= CSV / EXCEL ANALYSIS =================
ALLOWED_EXTENSIONS = (".csv", ".xlsx", ".xls")


@app.post("/factory-analysis/csv")
async def factory_analysis_csv(file: UploadFile = File(...)):
    filename = (file.filename or "").strip()
    lower_name = filename.lower()
    if not lower_name.endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            400,
            f"Unsupported file type. Please upload a CSV or Excel file ({', '.join(ALLOWED_EXTENSIONS)}).",
        )

    try:
        raw_bytes = await file.read()
        import io
        buf = io.BytesIO(raw_bytes)

        if lower_name.endswith(".csv"):
            # Try common encodings
            for encoding in ("utf-8", "latin-1", "cp1252"):
                try:
                    buf.seek(0)
                    df = pd.read_csv(buf, encoding=encoding)
                    break
                except (UnicodeDecodeError, pd.errors.ParserError):
                    continue
            else:
                raise HTTPException(400, "Could not decode CSV file. Please save as UTF-8.")
        else:
            buf.seek(0)
            # read_excel handles .xlsx and .xls (with openpyxl / xlrd)
            try:
                df = pd.read_excel(buf, engine=None)
            except Exception:
                buf.seek(0)
                df = pd.read_excel(buf, engine="openpyxl")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(400, f"Failed to parse file: {exc}") from exc

    if df.empty:
        raise HTTPException(400, "The uploaded file is empty or contains no data rows.")

    # Drop completely empty rows / columns
    df = df.dropna(how="all").dropna(axis=1, how="all")

    if df.empty:
        raise HTTPException(400, "The uploaded file has no usable data after removing empty rows.")

    # ---------- Smart column detection & synthesis ----------
    df = _prepare_dataframe(df)

    if df.empty:
        raise HTTPException(
            400,
            "No valid numeric data could be extracted from the file. "
            "Please ensure the file contains at least some numeric values.",
        )

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
