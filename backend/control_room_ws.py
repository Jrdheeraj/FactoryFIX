from fastapi import WebSocket
import asyncio
try:
    from .runtime_state import runtime_state, runtime_lock
except ImportError:
    from runtime_state import runtime_state, runtime_lock

async def control_room_socket(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            async with runtime_lock:
                payload = {
                    "machines": runtime_state["machines"],
                    "anomalies": runtime_state["anomalies"],
                    "scanCycle": runtime_state["scanCycle"],
                    "failureRisk": runtime_state["failureRisk"],
                    "defectRisk": runtime_state["defectRisk"],
                    "optimizationScore": runtime_state["optimizationScore"],
                    "lastScan": runtime_state["last_update"],
                    "log": "Live monitoring based on latest system state"
                }

            await websocket.send_json(payload)
            await asyncio.sleep(2)

    except Exception:
        # Client disconnected
        pass
