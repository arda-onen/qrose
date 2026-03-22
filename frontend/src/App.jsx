import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import RestaurantProductsPage from "./pages/RestaurantProductsPage";
import RestaurantAnalyticsPage from "./pages/RestaurantAnalyticsPage";
import RestaurantTablesPage from "./pages/RestaurantTablesPage";
import CategoryEditPage from "./pages/CategoryEditPage";
import ItemEditPage from "./pages/ItemEditPage";
import MenuSettingsPage from "./pages/MenuSettingsPage";
import AddCategoryPage from "./pages/AddCategoryPage";
import AddItemPage from "./pages/AddItemPage";
import RestaurantLayout from "./layouts/RestaurantLayout";
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
            <RestaurantLayout />
          </ProtectedRoute>
        }
        path="/restaurant"
      >
        <Route element={<RestaurantDashboard />} index />
        <Route element={<RestaurantProductsPage />} path="products" />
        <Route element={<RestaurantTablesPage />} path="tables" />
        <Route element={<RestaurantAnalyticsPage />} path="analytics" />
        <Route element={<MenuSettingsPage />} path="settings" />
        <Route element={<AddCategoryPage />} path="categories/new" />
        <Route element={<CategoryEditPage />} path="categories/:categoryId/edit" />
        <Route element={<AddItemPage />} path="items/new" />
        <Route element={<ItemEditPage />} path="items/:itemId/edit" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
