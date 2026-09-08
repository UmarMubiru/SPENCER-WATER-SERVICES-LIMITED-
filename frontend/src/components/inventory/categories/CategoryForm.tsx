"use client";

import { useState } from "react";
import { Category, CategoryInput } from "@/types/inventory/categories";

interface Props {
  initial?: Partial<Category>;
  onSubmit: (data: CategoryInput) => Promise<void>;
  submitLabel?: string;
}

const inputClass =
  "w-full rounded-lg border border-blue-200 px-4 py-2 text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-blue-700";

export default function CategoryForm({ initial, onSubmit, submitLabel = "Save Category" }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryInput>({ name: initial?.name ?? "", description: initial?.description ?? "", isActive: initial?.isActive ?? true });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      const data = err?.response?.data;
      const nameError = Array.isArray(data?.name) ? data.name[0] : data?.name;
      const detail = data?.detail;
      setError(nameError || detail || "Failed to save category. Please check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-blue-800">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={inputClass}
          rows={3}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-blue-700">
        <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
        Category is active
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
