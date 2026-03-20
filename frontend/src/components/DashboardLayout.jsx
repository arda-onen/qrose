import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ title, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">QRose</p>
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <p className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
              {user?.email} ({user?.role})
            </p>
            <Link
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              to="/"
            >
              Home
            </Link>
            <button
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800"
              onClick={logout}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4 pb-8">{children}</main>
    </div>
  );
}
