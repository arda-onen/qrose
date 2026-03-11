import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const payload = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });
      login(payload);
      navigate(payload.user.role === "admin" ? "/admin" : "/restaurant");
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form className="w-full max-w-sm space-y-3 rounded bg-white p-5 shadow" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">QRose Login</h1>
        <input
          className="w-full rounded border p-2"
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="Email"
          required
          type="email"
          value={form.email}
        />
        <input
          className="w-full rounded border p-2"
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          placeholder="Password"
          required
          type="password"
          value={form.password}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="w-full rounded bg-indigo-600 px-3 py-2 text-white" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
