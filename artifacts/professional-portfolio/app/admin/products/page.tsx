"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  Loader2,
  Star,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const EMPTY: Partial<Product> = {
  name: "",
  slug: "",
  description: "",
  long_description: "",
  price: 0,
  compare_at_price: null,
  images: [],
  category: "",
  tags: [],
  stock: 0,
  features: [],
  specs: {},
  is_featured: false,
  is_active: true,
};

function arrToStr(v: string[] | string | undefined): string {
  if (!v) return "";
  return Array.isArray(v) ? v.join(", ") : v;
}

function specsToStr(v: Record<string, string> | undefined): string {
  if (!v) return "";
  return Object.entries(v)
    .map(([k, val]) => `${k}: ${val}`)
    .join("\n");
}

function strToSpecs(s: string): Record<string, string> {
  const result: Record<string, string> = {};
  s.split("\n").forEach((line) => {
    const idx = line.indexOf(":");
    if (idx > 0) {
      result[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  });
  return result;
}

function ProductForm({
  product,
  onSave,
  onClose,
}: {
  product: Partial<Product>;
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Product>>(product);
  const [specsText, setSpecsText] = useState(specsToStr(product.specs));
  const [saving, setSaving] = useState(false);
  const isEdit = !!product.id;
  const set = (k: keyof Product, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.description?.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!form.category?.trim()) {
      toast.error("Category is required");
      return;
    }
    setSaving(true);
    try {
      const slug = form.slug?.trim() || slugify(form.name!);
      const toArr = (v: any) =>
        (Array.isArray(v) ? v : String(v ?? ""))
          .toString()
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      const payload = {
        ...form,
        slug,
        price: Number(form.price ?? 0),
        compare_at_price: form.compare_at_price
          ? Number(form.compare_at_price)
          : null,
        stock: Number(form.stock ?? 0),
        images: toArr(form.images),
        tags: toArr(form.tags),
        features: toArr(form.features),
        specs: strToSpecs(specsText),
      };
      const url = isEdit ? `/api/products/${product.id}` : "/api/products";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || "Save failed");
        return;
      }
      const saved = await res.json();
      toast.success(isEdit ? "Product updated." : "Product created.");
      onSave(saved);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="w-full max-w-3xl bg-[#0a0f1c] border border-slate-700 rounded-sm shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="font-mono font-bold text-lg">
            {isEdit ? "EDIT_HARDWARE" : "NEW_HARDWARE"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                NAME *
              </label>
              <Input
                value={form.name ?? ""}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!isEdit) set("slug", slugify(e.target.value));
                }}
                required
                placeholder="Product name"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                SLUG
              </label>
              <Input
                value={form.slug ?? ""}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="auto-generated"
                className="font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                CATEGORY *
              </label>
              <Input
                value={form.category ?? ""}
                onChange={(e) => set("category", e.target.value)}
                required
                placeholder="e.g. gaming-pc, workstation"
              />
            </div>
            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                SHORT DESCRIPTION *
              </label>
              <textarea
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                required
                className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                placeholder="Brief product summary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                LONG DESCRIPTION
              </label>
              <textarea
                value={form.long_description ?? ""}
                onChange={(e) => set("long_description", e.target.value)}
                rows={4}
                className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-primary resize-y"
                placeholder="Full product details..."
              />
            </div>
            {/* Pricing */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                PRICE (USD) *
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price ?? ""}
                onChange={(e) => set("price", e.target.value)}
                required
                placeholder="1299.00"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                COMPARE-AT PRICE (optional)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.compare_at_price ?? ""}
                onChange={(e) =>
                  set("compare_at_price", e.target.value || null)
                }
                placeholder="1599.00"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                STOCK (units)
              </label>
              <Input
                type="number"
                min="0"
                value={form.stock ?? 0}
                onChange={(e) => set("stock", Number(e.target.value))}
              />
            </div>
            {/* Arrays */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                TAGS (comma-separated)
              </label>
              <Input
                value={arrToStr(form.tags)}
                onChange={(e) => set("tags", e.target.value as any)}
                placeholder="gaming, RGB, high-performance"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                IMAGE URLS (comma-separated)
              </label>
              <Input
                value={arrToStr(form.images)}
                onChange={(e) => set("images", e.target.value as any)}
                placeholder="https://..., https://..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                FEATURES (comma-separated)
              </label>
              <Input
                value={arrToStr(form.features)}
                onChange={(e) => set("features", e.target.value as any)}
                placeholder="RTX 4090, 64GB RAM, 2TB NVMe"
              />
            </div>
            {/* Specs */}
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                SPECS (one per line: Key: Value)
              </label>
              <textarea
                value={specsText}
                onChange={(e) => setSpecsText(e.target.value)}
                rows={5}
                className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary resize-y"
                placeholder={
                  "CPU: Intel Core i9-14900K\nGPU: NVIDIA RTX 4090\nRAM: 64GB DDR5"
                }
              />
            </div>
            {/* Toggles */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured ?? false}
                  onChange={(e) => set("is_featured", e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="font-mono text-sm text-slate-300 flex items-center gap-1">
                  <Star className="h-3 w-3 text-primary" /> FEATURED
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active ?? true}
                  onChange={(e) => set("is_active", e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="font-mono text-sm text-slate-300">ACTIVE</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="font-mono"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="font-mono bg-primary text-black hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> SAVING...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />{" "}
                  {isEdit ? "UPDATE" : "CREATE"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all products including inactive ones
    fetch("/api/products?limit=200")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (saved: Product) => {
    setProducts((prev) =>
      prev.some((p) => p.id === saved.id)
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...prev],
    );
    setEditing(null);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("DESTROY_HARDWARE_PROFILE?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted.");
    } catch {
      toast.error("Deletion failed.");
    }
  };

  const toggleActive = async (product: Product) => {
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !product.is_active }),
    });
    if (!res.ok) {
      toast.error("Update failed");
      return;
    }
    const updated = await res.json();
    setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
    toast.success(
      `Product ${updated.is_active ? "activated" : "deactivated"}.`,
    );
  };

  return (
    <div className="space-y-8">
      {editing && (
        <ProductForm
          product={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-mono">
          HARDWARE_INVENTORY{" "}
          <span className="text-slate-500 text-lg">({products.length})</span>
        </h1>
        <Button
          onClick={() => setEditing(EMPTY)}
          className="font-mono bg-primary text-black hover:bg-primary/80"
        >
          <Plus className="mr-2 h-4 w-4" /> NEW_HARDWARE
        </Button>
      </div>

      <div className="bg-[#0a0f1c] border border-slate-800 rounded-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900 border-b border-slate-800 font-mono text-slate-400 text-xs">
            <tr>
              <th className="p-4 font-normal">ITEM / SLUG</th>
              <th className="p-4 font-normal hidden md:table-cell">CLASS</th>
              <th className="p-4 font-normal">STOCK</th>
              <th className="p-4 font-normal">PRICE</th>
              <th className="p-4 font-normal hidden lg:table-cell">STATUS</th>
              <th className="p-4 font-normal text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-slate-500 font-mono text-sm"
                >
                  LOADING_INVENTORY...
                </td>
              </tr>
            )}
            {!loading &&
              products.map((product) => (
                <tr
                  key={product.id}
                  className={`hover:bg-slate-800/30 transition-colors ${!product.is_active ? "opacity-50" : ""}`}
                >
                  <td className="p-4">
                    <div className="font-semibold flex items-center gap-2">
                      {product.name}
                      {product.is_featured && (
                        <span className="text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded">
                          FEATURED
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 font-mono text-xs mt-0.5">
                      /{product.slug}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="px-2 py-1 bg-slate-800 rounded text-xs font-mono">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono">
                    <span
                      className={
                        product.stock > 0 ? "text-green-400" : "text-red-500"
                      }
                    >
                      {product.stock} units
                    </span>
                  </td>
                  <td className="p-4 font-mono">
                    <div>{formatPrice(product.price)}</div>
                    {product.compare_at_price && (
                      <div className="text-xs text-slate-500 line-through">
                        {formatPrice(product.compare_at_price)}
                      </div>
                    )}
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <button
                      onClick={() => toggleActive(product)}
                      className={`flex items-center gap-1 text-xs font-mono ${product.is_active ? "text-green-400" : "text-slate-500"}`}
                    >
                      {product.is_active ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                      {product.is_active ? "ACTIVE" : "HIDDEN"}
                    </button>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditing(product)}
                      className="text-slate-400 hover:text-primary"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteProduct(product.id)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 ml-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            {!loading && products.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-slate-500 font-mono"
                >
                  NO_INVENTORY_FOUND
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
