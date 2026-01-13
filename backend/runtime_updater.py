import asyncio
import random
from datetime import datetime
from runtime_state import runtime_state, runtime_lock

async def runtime_updater():
    while True:
        async with runtime_lock:
            runtime_state["machines"] = random.randint(5, 15)
            runtime_state["anomalies"] = random.randint(0, 4)

            runtime_state["failureRisk"] = random.randint(10, 90)
            runtime_state["defectRisk"] = random.randint(10, 85)
            runtime_state["optimizationScore"] = random.randint(60, 98)

            runtime_state["last_update"] = datetime.utcnow().isoformat()

        await asyncio.sleep(2)
