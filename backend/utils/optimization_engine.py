# backend/utils/optimization_engine.py

import pandas as pd

# Factory constraints (Toyota problem)
SHIFTS = 2
HOURS_PER_SHIFT = 8
SECONDS_PER_DAY = SHIFTS * HOURS_PER_SHIFT * 3600
MAX_NEW_MACHINES = 2


def apply_failure_impact(df: pd.DataFrame, failure_probs: list):
    """
    Increase downtime based on ML-predicted machine failure probability
    """
    df = df.copy()

    for i, prob in enumerate(failure_probs):
        if i >= len(df):
            break

        if prob > 0.7:
            df.loc[i, "Downtime_pct"] += 10
        elif prob > 0.4:
            df.loc[i, "Downtime_pct"] += 5

    return df


def calculate_throughput(df: pd.DataFrame):
    """
    Calculate effective cycle time and throughput per process
    """
    df = df.copy()

    df["Effective_Cycle_Time"] = (
        df["Cycle_Time_sec"] / (1 - df["Downtime_pct"] / 100)
    )

    df["Throughput"] = (
        SECONDS_PER_DAY * df["Current_Machines"]
    ) / df["Effective_Cycle_Time"]

    return df


def optimize_line(df: pd.DataFrame):
    """
    Optimize production line by adding machines only at bottlenecks
    (max 2 machines total)
    """
    df = df.copy()
    actions = []
    added = 0

    # Initial throughput
    df = calculate_throughput(df)

    while added < MAX_NEW_MACHINES:
        bottleneck_idx = df["Throughput"].idxmin()
        process_id = df.loc[bottleneck_idx, "Process_ID"]

        df.loc[bottleneck_idx, "Current_Machines"] += 1
        added += 1

        actions.append(f"Added 1 machine to {process_id}")

        # Recalculate after change
        df = calculate_throughput(df)

    final_output = int(df["Throughput"].min())

    return {
        "optimized_table": df,
        "actions": actions,
        "final_output_units_per_day": final_output
    }
