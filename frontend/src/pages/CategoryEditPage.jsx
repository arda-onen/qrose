import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { apiFileUrl, apiRequest } from "../lib/api";

export default function CategoryEditPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const category = useMemo(
    () => menu?.categories.find((entry) => entry.id === Number(categoryId)) || null,
    [menu, categoryId]
  );

  useEffect(() => {
    async function loadMenu() {
      try {
        const data = await apiRequest("/restaurant/menu");
        setMenu(data);
      } catch (loadError) {
        setError(loadError.message);
      }
    }
    loadMenu();
  }, []);

  useEffect(() => {
    if (!category) {
      return;
    }
    setName(category.name || "");
    setShortDescription(category.short_description || "");
  }, [category]);

  async function saveCategory(event) {
    event.preventDefault();
    try {
      await apiRequest(`/restaurant/categories/${categoryId}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          short_description: shortDescription
        })
      });
      if (imageFile) {
        const body = new FormData();
        body.append("image", imageFile);
        await apiRequest(`/restaurant/categories/${categoryId}/image`, { method: "POST", body });
      }
      setNotice("Category updated.");
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  if (!menu) {
    return (
      <DashboardLayout title="Edit Category">
        <p className="text-sm text-slate-600">Loading...</p>
      </DashboardLayout>
    );
  }

  if (!category) {
    return (
      <DashboardLayout title="Edit Category">
        <p className="text-sm text-red-600">Category not found.</p>
        <Link className="mt-3 inline-block text-sm font-semibold text-indigo-600" to="/restaurant">
          Back to Dashboard
        </Link>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Edit Category: ${category.name}`}>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">Update category info and image</p>
          <button
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            onClick={() => navigate("/restaurant")}
            type="button"
          >
            Back
          </button>
        </div>
        <form className="space-y-3" onSubmit={saveCategory}>
          <input
            className="w-full rounded-md border border-slate-300 p-2.5"
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            required
            value={name}
          />
          <textarea
            className="w-full rounded-md border border-slate-300 p-2.5"
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Category short description"
            rows={3}
            value={shortDescription}
          />
          <input className="w-full text-sm" onChange={(e) => setImageFile(e.target.files?.[0] || null)} type="file" />
          {category.image ? (
            <img
              alt={category.name}
              className="h-36 w-full rounded-xl border object-cover"
              src={category.image.startsWith("/uploads/") ? apiFileUrl(category.image) : category.image}
            />
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {notice ? <p className="text-sm text-emerald-700">{notice}</p> : null}
          <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800" type="submit">
            Save Category
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
