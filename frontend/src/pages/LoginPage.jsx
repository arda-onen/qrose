import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ui } from "../lib/restaurantDashboardUi";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });
      login(payload);
      navigate(payload.user.role === "admin" ? "/admin" : "/restaurant");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form className="w-full max-w-sm space-y-3 rounded bg-white p-5 shadow" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">QRose Login</h1>
        <input
          className="w-full rounded border border-slate-200 p-2.5 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
          disabled={submitting}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="Email"
          required
          type="email"
          value={form.email}
        />
        <input
          className="w-full rounded border border-slate-200 p-2.5 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
          disabled={submitting}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          placeholder="Password"
          required
          type="password"
          value={form.password}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          className={`${ui.primaryBtn} w-full justify-center bg-indigo-600 hover:bg-indigo-700`}
          disabled={submitting}
          type="submit"
        >
          {submitting ? (
            <>
              <span aria-hidden className={ui.btnSpinner} />
              Giriş yapılıyor…
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
}
