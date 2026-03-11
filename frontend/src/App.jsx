import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import PublicMenuPage from "./pages/PublicMenuPage";
import ProtectedRoute from "./components/ProtectedRoute";

function HomePage() {
  const { user, isAuthenticated } = useAuth();
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-3 p-4 text-center">
      <h1 className="text-3xl font-bold text-slate-900">QRose Menu Platform</h1>
      <p className="text-slate-600">
        Admin creates QR menu projects. Restaurant users manage their own menu.
      </p>
      {isAuthenticated ? (
        <Link
          className="rounded bg-indigo-600 px-4 py-2 text-white"
          to={user.role === "admin" ? "/admin" : "/restaurant"}
        >
          Go to Dashboard
        </Link>
      ) : (
        <Link className="rounded bg-indigo-600 px-4 py-2 text-white" to="/login">
          Login
        </Link>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<PublicMenuPage />} path="/menu/:slug" />
      <Route
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
        path="/admin"
      />
      <Route
        element={
          <ProtectedRoute roles={["restaurant"]}>
            <RestaurantDashboard />
          </ProtectedRoute>
        }
        path="/restaurant"
      />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
