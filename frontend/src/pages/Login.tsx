import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");

  async function handleLogin() {
    const res = await fetch(
      `http://localhost:8001/auth/login?username=${username}`,
      { method: "POST" }
    );
    const data = await res.json();
    login(data.token);
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>FactoryFix AI Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
