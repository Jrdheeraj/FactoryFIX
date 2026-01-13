from asyncio import Lock

runtime_state = {
    "machines": 0,
    "anomalies": 0,
    "failureRisk": 0,
    "defectRisk": 0,
    "optimizationScore": 0,
    "scanCycle": 0,
    "last_update": None,
}

runtime_lock = Lock()
