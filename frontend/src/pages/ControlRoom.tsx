import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useControlRoomSocket } from "../hooks/useControlRoomSocket";
import { uploadCSV } from "../api/upload";
import { resetFactory } from "../api/reset";
import { FactorySelector } from "../components/FactorySelector";
import { RiskChart } from "../components/RiskChart";

export default function ControlRoom() {
  const { token, logout } = useAuth();
  const [factoryId, setFactoryId] = useState("factory-1");
  const data = useControlRoomSocket(factoryId);

  return (
    <div style={{ padding: 20 }}>
      <h2>FactoryFix Control Room</h2>

      <FactorySelector value={factoryId} onChange={setFactoryId} />

      <br /><br />

      <input
        type="file"
        onChange={(e) =>
          e.target.files &&
          token &&
          uploadCSV(e.target.files[0], factoryId, token)
        }
      />

      <button onClick={() => resetFactory(factoryId)}>
        Reset to Simulation
      </button>

      <button onClick={logout}>Logout</button>

      {data && (
        <>
          <h3>Mode: {data.state.data_loaded ? "REAL DATA" : "SIMULATION"}</h3>
          <h3>Machines: {data.state.machines}</h3>
          <h3>Anomalies: {data.state.anomalies}</h3>

          <RiskChart history={data.history} />
        </>
      )}
    </div>
  );
}
