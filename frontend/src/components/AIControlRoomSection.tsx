import { useEffect, useRef, useState } from "react";
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

  /* ---------------- WEBSOCKET CONNECTION (FIXED) ---------------- */
  useEffect(() => {
    wsRef.current = new WebSocket("ws://127.0.0.1:8001/ws/control-room"); // ✅ FIXED PORT

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const liveStats: LiveStats = {
        machines: data.machines ?? 0,
        anomalies: data.anomalies ?? 0,
        scanCycle: data.scanCycle ?? 0,           // ✅ use backend value
        failureRisk: data.failureRisk ?? 0,
        defectRisk: data.defectRisk ?? 0,
        optimizationScore: data.optimizationScore ?? 0,
        lastScan: data.lastScan ?? "",             // ✅ correct field
        log: data.log ?? "",
      };

      setStats(liveStats);
      setLogs((prev) => [...prev.slice(-4), liveStats.log]);
    };

    wsRef.current.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    return () => wsRef.current?.close();
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
        {/* HEADER */}
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

        {/* STATUS CARDS */}
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

        {/* AI RUNTIME LOG */}
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

        {/* CONFIDENCE METRICS */}
        <div className="grid md:grid-cols-3 gap-6">
          <Metric
            label="Failure Prediction Confidence"
            value={stats.failureRisk}
            tooltip="Probability of machine failure inferred from live sensor data"
            reason={failureReason}
          />
          <Metric
            label="Defect Detection Confidence"
            value={stats.defectRisk}
            tooltip="Likelihood of product quality defects based on process stability"
            reason={defectReason}
          />
          <Metric
            label="Optimization Accuracy"
            value={stats.optimizationScore}
            tooltip="Effectiveness of AI-driven optimization actions"
            reason="Optimization decisions are aligned with throughput and risk constraints."
          />
        </div>
      </div>
    </section>
  );
};

/* ---------------- UI COMPONENTS ---------------- */

const Status = ({ label, value, icon: Icon }: any) => (
  <div className="relative rounded-2xl p-6 bg-gradient-to-br from-[#141414] to-[#0e0e0e] border border-white/10">
    <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-pulse" />
    <Icon className="w-6 h-6 text-primary mb-4" />
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const Metric = ({ label, value, tooltip, reason }: any) => (
  <div className="rounded-2xl p-6 bg-gradient-to-br from-[#141414] to-[#0e0e0e] border border-white/10">
    <div className="flex items-center gap-2 mb-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="group relative">
        <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
        <div className="absolute hidden group-hover:block w-56 text-xs bg-black p-3 rounded-lg border border-white/10 text-muted-foreground -top-2 left-6 z-20">
          {tooltip}
        </div>
      </div>
    </div>

    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        animate={{ width: `${value}%` }}
        transition={{ duration: 1 }}
        className="h-full bg-primary"
      />
    </div>

    <motion.p
      key={value}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-right text-primary mt-2 font-medium"
    >
      {value}%
    </motion.p>

    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
      {reason}
    </p>
  </div>
);
