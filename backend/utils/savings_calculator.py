def calculate_savings(defect_risk, failure_risk):
    base_loss = 500000  # ₹5L/month assumed loss

    defect_saving = (defect_risk / 100) * 0.4
    failure_saving = (failure_risk / 100) * 0.6

    total_saving = base_loss * (defect_saving + failure_saving)
    return f"₹{int(total_saving):,}/month"
