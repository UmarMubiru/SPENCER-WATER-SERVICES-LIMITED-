"use client";

import { useState } from "react";
import { Supplier, SupplierInput } from "@/types/inventory/supplier";

interface Props {
  initial?: Partial<Supplier>;
  onSubmit: (data: SupplierInput) => Promise<void>;
  submitLabel?: string;
}

const inputClass =
  "w-full rounded-lg border border-blue-200 px-4 py-2 text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-blue-700";

export default function SupplierForm({ initial, onSubmit, submitLabel = "Save Supplier" }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<SupplierInput>({
    name: initial?.name ?? "",
    contactPerson: initial?.contactPerson ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    address: initial?.address ?? "",
    status: initial?.status ?? "ACTIVE",
  });

  function update<K extends keyof SupplierInput>(key: K, value: SupplierInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.response?.data?.name?.[0] ?? "Failed to save supplier.");
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

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Supplier Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Contact Person</label>
          <input
            value={form.contactPerson}
            onChange={(e) => update("contactPerson", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Address</label>
          <textarea
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className={inputClass}
            rows={3}
          />
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value as "ACTIVE" | "INACTIVE")}
            className={inputClass}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

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
