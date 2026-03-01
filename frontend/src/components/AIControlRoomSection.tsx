import { useEffect, useRef, useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import { Activity, Cpu, AlertTriangle, CheckCircle, Info } from "lucide-react";

type LiveStats = {
  machines: number;
  anomalies: number;
  scanCycle: number;
  failureRisk: number;
  defectRisk: number;
  optimizationScore: number;
  lastScan: string;
  log: string;
};

export const AIControlRoomSection = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const initializedRef = useRef(false); // ✅ FIX

  const [stats, setStats] = useState<LiveStats>({
    machines: 0,
    anomalies: 0,
    scanCycle: 0,
    failureRisk: 0,
    defectRisk: 0,
    optimizationScore: 0,
    lastScan: "",
    log: "Waiting for any CSV upload",
  });

  const [logs, setLogs] = useState<string[]>([]);

  /* ---------------- WEBSOCKET CONNECTION (STRICTMODE SAFE) ---------------- */
  useEffect(() => {
    if (initializedRef.current) return; // ✅ PREVENT DOUBLE RUN
    initializedRef.current = true;

    wsRef.current = new WebSocket("ws://127.0.0.1:8001/ws/control-room");

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const liveStats: LiveStats = {
        machines: data.machines ?? 0,
        anomalies: data.anomalies ?? 0,
        scanCycle: data.scanCycle ?? 0,
        failureRisk: data.failureRisk ?? 0,
        defectRisk: data.defectRisk ?? 0,
        optimizationScore: data.optimizationScore ?? 0,
        lastScan: data.lastScan ?? "",
        log: data.log ?? "",
      };

      setStats(liveStats);
      setLogs((prev) => [...prev.slice(-4), liveStats.log]);
    };

    wsRef.current.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    return () => {
      wsRef.current?.close();
    };
  }, []);

  /* ---------------- EXPLAINABILITY ---------------- */
  const failureReason =
    stats.failureRisk > 80
      ? "Elevated process temperature and vibration patterns detected."
      : "Failure risk within safe operating limits.";

  const defectReason =
    stats.defectRisk > 70
      ? "Quality instability inferred from torque and RPM variance."
      : "Product quality indicators are stable.";

  return (
    <section className="pt-12 pb-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      <div className="container relative z-10 px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-primary text-sm uppercase tracking-widest block mb-3">
            Live Intelligence
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-3">
            AI <span className="text-primary">Control Room</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            Continuous real-time AI inference monitoring machine health, risk, and optimization.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 mb-14">
          <Status label="System Status" value="ACTIVE" icon={Activity} />
          <Status label="Machines Monitored" value={stats.machines} icon={Cpu} />
          <Status label="Anomalies Detected" value={stats.anomalies} icon={AlertTriangle} />
          <Status label="Scan Cycle" value={`#${stats.scanCycle}`} icon={Cpu} />
          <Status
            label="Last Scan"
            value={stats.lastScan ? new Date(stats.lastScan).toLocaleTimeString() : "--"}
            icon={CheckCircle}
          />
        </div>

        <div className="max-w-4xl mx-auto mb-14 rounded-3xl p-10 bg-gradient-to-br from-[#141414] to-[#0e0e0e] border border-white/10">
          <h3 className="text-xl font-semibold mb-6">AI Runtime Log</h3>
          <div className="space-y-3">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3 text-muted-foreground">
                <span className="w-2 h-2 mt-2 bg-primary rounded-full animate-pulse" />
                {log}
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Metric label="Failure Prediction Confidence" value={stats.failureRisk} tooltip="" reason={failureReason} />
          <Metric label="Defect Detection Confidence" value={stats.defectRisk} tooltip="" reason={defectReason} />
          <Metric label="Optimization Accuracy" value={stats.optimizationScore} tooltip="" reason="" />
        </div>
      </div>
    </section>
  );
};

/* ---------------- UI COMPONENTS ---------------- */

type StatusProps = {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
};

const Status = ({ label, value, icon: Icon }: StatusProps) => (
  <div className="relative rounded-2xl p-6 bg-gradient-to-br from-[#141414] to-[#0e0e0e] border border-white/10">
    <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-pulse" />
    <Icon className="w-6 h-6 text-primary mb-4" />
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

type MetricProps = {
  label: string;
  value: number;
  reason: string;
};

const Metric = ({ label, value, reason }: MetricProps) => (
  <div className="rounded-2xl p-6 bg-gradient-to-br from-[#141414] to-[#0e0e0e] border border-white/10">
    <p className="text-sm text-muted-foreground mb-2">{label}</p>
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <motion.div animate={{ width: `${value}%` }} className="h-full bg-primary" />
    </div>
    <p className="text-right text-primary mt-2 font-medium">{value}%</p>
    <p className="text-xs text-muted-foreground mt-3">{reason}</p>
  </div>
);
