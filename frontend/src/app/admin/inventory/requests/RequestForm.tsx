"use client";

import { useState, useEffect } from "react";
import { MaterialRequestInput } from "@/types/inventory/requests";
import { useInventoryItems } from "@/hooks/inventory/useInventoryItems";
import { useProjects } from "@/hooks/useProjects";

interface Props {
  onSubmit: (data: MaterialRequestInput) => Promise<void>;
}

type LineItem = {
  inventoryItem: string;
  quantityRequested: number;
  responsiblePerson?: string;
  expectedReturnDate?: string;
};

interface Employee {
  id: string;
  full_name: string;
}

const inputClass =
  "w-full rounded-lg border border-blue-200 px-4 py-2 text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-blue-700";

export default function RequestForm({ onSubmit }: Props) {
  const { items } = useInventoryItems({ page: 1 });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { projects, loading: loadingProjects } = useProjects({});
  const [projectId, setProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectEndDate, setProjectEndDate] = useState("");
  const [department, setDepartment] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineItem[]>([{ inventoryItem: "", quantityRequested: 1 }]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/employees/employees/');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.results || data);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  function updateLine(index: number, patch: Partial<LineItem>) {
    setLines((ls) => ls.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((ls) => [...ls, { inventoryItem: "", quantityRequested: 1 }]);
  }

  function removeLine(index: number) {
    setLines((ls) => ls.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validLines = lines.filter((l) => l.inventoryItem && l.quantityRequested > 0);
    if (validLines.length === 0) {
      setError("Add at least one item with a quantity.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        projectId,
        projectName,
        department,
        notes,
        items: validLines,
      });
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to submit request.");
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
          <label className={labelClass}>Project</label>
          <select
            value={projectId}
            onChange={(e) => {
              const selectedId = e.target.value;
              setProjectId(selectedId);
              const selectedProject = projects.find((p) => p.id === selectedId);
              setProjectName(selectedProject?.name ?? "");
              setProjectEndDate(selectedProject?.planned_end_date ?? "");
            }}
            className={inputClass}
            required
          >
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_reference} — {project.name}
              </option>
            ))}
          </select>
          {loadingProjects && (
            <p className="mt-2 text-xs text-blue-400">Loading projects…</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Department</label>
          <input value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass} />
        </div>
      </div>

      {projectName && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-700">Selected project</p>
          <p className="mt-1 text-blue-900">{projectName}</p>
          {projectEndDate && (
            <p className="mt-1 text-sm text-slate-500">Project End Date: {new Date(projectEndDate).toLocaleDateString()}</p>
          )}
        </div>
      )}

      <div>
        <label className={labelClass}>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} rows={3} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={labelClass}>Items</label>
          <button
            type="button"
            onClick={addLine}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            + Add item
          </button>
        </div>

        <div className="space-y-3">
          {lines.map((line, i) => {
            const selectedItem = items.find((it) => it.id === line.inventoryItem);
            const isTool = selectedItem?.inventoryType === "COMPANY_TOOL";

            return (
              <div key={i} className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
                <div className="flex items-end gap-3 mb-3">
                  <div className="flex-1">
                    <select
                      value={line.inventoryItem}
                      onChange={(e) => {
                        updateLine(i, { inventoryItem: e.target.value });
                        const item = items.find((it) => it.id === e.target.value);
                        if (item?.inventoryType === "COMPANY_TOOL" && projectEndDate) {
                          updateLine(i, { expectedReturnDate: projectEndDate });
                        }
                      }}
                      className={inputClass}
                    >
                      <option value="">— Select item —</option>
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.sku} — {it.name} ({it.inventoryType === "COMPANY_TOOL" ? "Tool" : "Material"}) (in stock: {it.quantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-28">
                    <input
                      type="number"
                      min={1}
                      value={line.quantityRequested}
                      onChange={(e) => updateLine(i, { quantityRequested: Number(e.target.value) })}
                      className={inputClass}
                      placeholder="Qty"
                    />
                  </div>

                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      className="rounded-lg border border-blue-200 px-3 py-2 text-blue-500 hover:bg-blue-50"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {isTool && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-blue-700 mb-1 block">Responsible Person</label>
                      <select
                        value={line.responsiblePerson || ""}
                        onChange={(e) => updateLine(i, { responsiblePerson: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">Select person</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-blue-700 mb-1 block">Expected Return Date</label>
                      <input
                        type="date"
                        value={line.expectedReturnDate || ""}
                        onChange={(e) => updateLine(i, { expectedReturnDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
