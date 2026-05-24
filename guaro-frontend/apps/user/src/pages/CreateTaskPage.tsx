import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useModules } from "@/hooks/useModules";
import { useBrands } from "@/hooks/useBrands";
import { useCreateTask } from "@/hooks/useTasks";
import { Badge } from "@/components/ui/Badge";
import { Check, ChevronRight, Link as LinkIcon } from "lucide-react";
import type { Module, Section, TaskType, Brand } from "@guaro/types";

type Step = 1 | 2 | 3 | 4;

interface FormState {
  module: Module | null;
  section: Section | null;
  taskType: TaskType | null;
  brand: Brand | null;
  storesScope: "all" | "select";
  priority: "normal" | "high" | "urgent";
  sheetUrl: string;
  notes: string;
}

export function CreateTaskPage() {
  const { data: modulesData = [] } = useModules();
  const { data: brandsData = [] } = useBrands();
  const createTask = useCreateTask();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [brandSearch, setBrandSearch] = useState("");
  const [form, setForm] = useState<FormState>({
    module: null,
    section: null,
    taskType: null,
    brand: null,
    storesScope: "all",
    priority: "normal",
    sheetUrl: "",
    notes: "",
  });

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el) el.textContent = "Create task";

    const brandId = searchParams.get("brandId");
    if (brandId) {
      const brand = brandsData.find((b) => b.id === brandId);
      if (brand) setForm((f) => ({ ...f, brand }));
    }
  }, [searchParams, brandsData]);

  const steps = [
    { n: 1, label: "Task type" },
    { n: 2, label: "Brand" },
    { n: 3, label: "Details" },
    { n: 4, label: "Review" },
  ];

  const needsFile =
    form.taskType &&
    form.taskType.executionMode !== "MANUAL" &&
    form.taskType.executionMode !== "HYBRID";

  const canProceed: Record<number, boolean> = {
    1: !!form.taskType,
    2: !!form.brand,
    3: !needsFile || !!form.sheetUrl,
    4: true,
  };

  const filteredBrands = brandsData.filter(
    (b) =>
      b.name.toLowerCase().includes(brandSearch.toLowerCase()) ||
      b.merchant?.name.toLowerCase().includes(brandSearch.toLowerCase()),
  );

  function next() {
    if (step < 4) setStep((s) => (s + 1) as Step);
  }

  function back() {
    if (step > 1) setStep((s) => (s - 1) as Step);
    else navigate("/tasks");
  }

  async function submit() {
    if (!form.taskType || !form.brand) return;
    try {
      await createTask.mutateAsync({
        taskTypeId: form.taskType.id,
        brandId: form.brand.id,
        inputType: needsFile ? "SHEET_LINK" : "NONE",
        inputValue: needsFile ? form.sheetUrl : undefined,
        formData: {
          storesScope: form.storesScope,
          notes: form.notes,
        },
        priority: form.priority,
      });
      navigate("/tasks");
    } catch (err) {
      console.error("Failed to create task", err);
    }
  }

  return (
    <div className="p-5 max-w-2xl">
      <div className="flex items-center gap-1.5 text-xs text-text-tertiary mb-5">
        <Link
          to="/tasks"
          className="hover:text-text-secondary transition-colors"
        >
          My tasks
        </Link>
        <ChevronRight size={12} />
        <span className="text-text-primary font-medium">Create task</span>
      </div>

      <div className="flex items-center gap-0 mb-6">
        {steps.map(({ n, label }, i) => (
          <div key={n} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center
                               text-[11px] font-medium flex-shrink-0 transition-colors ${
                                 n < step
                                   ? "bg-success-text text-white"
                                   : n === step
                                     ? "bg-accent text-white"
                                     : "bg-surface-secondary text-text-tertiary border border-border"
                               }`}
              >
                {n < step ? <Check size={11} /> : n}
              </div>
              <span
                className={`text-xs ${
                  n === step
                    ? "font-medium text-text-primary"
                    : "text-text-secondary"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-3 h-px w-8 transition-colors ${
                  n < step ? "bg-success-text" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="card p-5">
        {/* STEP 1 — Task type */}
        {step === 1 && (
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Select task type
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Choose a module and task type
            </p>

            {modulesData.length === 0 && (
              <p className="text-xs text-text-tertiary text-center py-6">
                Loading modules...
              </p>
            )}

            <div className="space-y-4">
              {modulesData.map((mod) => {
                const modSections = (mod as any).sections ?? [];
                return (
                  <div key={mod.id}>
                    <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
                      {mod.name}
                    </p>
                    <div className="space-y-2">
                      {modSections.map((sec: any) => {
                        const secTasks = sec.taskTypes ?? [];
                        return (
                          <div
                            key={sec.id}
                            className="border border-border rounded-lg overflow-hidden"
                          >
                            <div className="px-3 py-2 bg-surface-secondary border-b border-border">
                              <p className="text-xs font-medium text-text-secondary">
                                {sec.name}
                              </p>
                            </div>
                            <div className="divide-y divide-border">
                              {secTasks.map((tt: any) => (
                                <button
                                  key={tt.id}
                                  onClick={() => {
                                    setForm((f) => ({
                                      ...f,
                                      module: mod,
                                      section: sec,
                                      taskType: tt,
                                    }));
                                    setStep(2);
                                  }}
                                  className={`w-full flex items-center justify-between
                                              px-3 py-2.5 text-left hover:bg-surface-secondary
                                              transition-colors ${
                                                form.taskType?.id === tt.id
                                                  ? "bg-info-bg"
                                                  : ""
                                              }`}
                                >
                                  <div>
                                    <p
                                      className={`text-xs font-medium ${
                                        form.taskType?.id === tt.id
                                          ? "text-info-text"
                                          : "text-text-primary"
                                      }`}
                                    >
                                      {tt.name}
                                    </p>
                                    <p className="text-[11px] text-text-tertiary">
                                      {tt.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Badge status={tt.executionMode} />
                                    {form.taskType?.id === tt.id && (
                                      <Check
                                        size={13}
                                        className="text-info-text"
                                      />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2 — Brand */}
        {step === 2 && (
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Select brand
            </h3>
            <p className="text-xs text-text-secondary mb-3">
              {form.taskType?.name} · {form.section?.name}
            </p>
            <input
              type="text"
              className="input mb-3 w-full"
              placeholder="Search brand or merchant..."
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
            />
            <div className="border border-border rounded-lg divide-y divide-border max-h-72 overflow-y-auto">
              {filteredBrands.length === 0 && (
                <p className="text-xs text-text-tertiary text-center py-6">
                  No brands found
                </p>
              )}
              {filteredBrands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setForm((f) => ({ ...f, brand: b }))}
                  className={`w-full flex items-center justify-between px-3 py-2.5
                               text-left hover:bg-surface-secondary transition-colors ${
                                 form.brand?.id === b.id ? "bg-info-bg" : ""
                               }`}
                >
                  <div>
                    <p
                      className={`text-xs font-medium ${
                        form.brand?.id === b.id
                          ? "text-info-text"
                          : "text-text-primary"
                      }`}
                    >
                      {b.isSubBrand && (
                        <span className="text-text-tertiary mr-1">↳</span>
                      )}
                      {b.name}
                    </p>
                    <p className="text-[11px] text-text-tertiary">
                      {b.merchant?.name} · {b.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge status={b.kaType} />
                    <Badge status={b.status} />
                    {form.brand?.id === b.id && (
                      <Check size={13} className="text-info-text" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 — Details */}
        {step === 3 && (
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Task details
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              {form.taskType?.name} · {form.brand?.name}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  Stores scope
                </label>
                <select
                  className="select w-full"
                  value={form.storesScope}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      storesScope: e.target.value as "all" | "select",
                    }))
                  }
                >
                  <option value="all">All stores</option>
                  <option value="select">Select specific stores</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  Priority
                </label>
                <select
                  className="select w-full"
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      priority: e.target.value as "normal" | "high" | "urgent",
                    }))
                  }
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {needsFile && (
              <div className="mb-3">
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  Google Sheets link <span className="text-danger-text">*</span>
                </label>
                <div className="flex items-center gap-2 input">
                  <LinkIcon
                    size={13}
                    className="text-text-tertiary flex-shrink-0"
                  />
                  <input
                    type="text"
                    className="flex-1 bg-transparent outline-none text-xs"
                    placeholder="https://docs.google.com/spreadsheets/..."
                    value={form.sheetUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sheetUrl: e.target.value }))
                    }
                  />
                </div>
                <p className="text-[11px] text-text-tertiary mt-1">
                  Make sure the sheet is shared with the service account.
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1.5">
                Notes
              </label>
              <textarea
                className="input w-full h-16 resize-none"
                placeholder="Optional context for the BPO..."
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
          </div>
        )}

        {/* STEP 4 — Review */}
        {step === 4 && (
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Review & confirm
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Check everything before submitting
            </p>

            <div className="bg-surface-secondary rounded-lg p-3 space-y-0 mb-4">
              <ReviewRow label="Module" value={form.module?.name} />
              <ReviewRow label="Section" value={form.section?.name} />
              <ReviewRow
                label="Task type"
                value={
                  <span className="flex items-center gap-2">
                    {form.taskType?.name}
                    {form.taskType && (
                      <Badge status={form.taskType.executionMode} />
                    )}
                  </span>
                }
              />
              <ReviewRow label="Brand" value={form.brand?.name} />
              <ReviewRow label="Merchant" value={form.brand?.merchant?.name} />
              <ReviewRow label="Country" value={form.brand?.country} />
              <ReviewRow
                label="Stores scope"
                value={
                  form.storesScope === "all" ? "All stores" : "Selected stores"
                }
              />
              {needsFile && (
                <ReviewRow
                  label="Sheet URL"
                  value={
                    <span className="text-info-text font-mono text-[11px] truncate max-w-[200px] block">
                      {form.sheetUrl}
                    </span>
                  }
                />
              )}
              <ReviewRow
                label="Priority"
                value={<span className="capitalize">{form.priority}</span>}
              />
              <ReviewRow
                label="BPO assignment"
                value="Auto — weight balanced"
              />
            </div>

            <div className="flex items-start gap-2.5 bg-info-bg border border-info-border rounded-md px-3 py-2.5">
              <div className="w-4 h-4 rounded-full bg-info-text flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-[10px] font-bold">i</span>
              </div>
              <p className="text-xs text-info-text">
                {needsFile
                  ? "The worker will start automatically. You'll be notified when it completes or if it encounters issues."
                  : "This task will be assigned to a BPO automatically. Track its progress in My Tasks."}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-5 pt-4 border-t border-border">
          <button
            className="btn btn-ghost btn-sm text-text-secondary"
            onClick={back}
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>
          {step > 1 && (
            <button
              className="btn btn-primary btn-sm"
              disabled={!canProceed[step] || createTask.isPending}
              onClick={step === 4 ? submit : next}
            >
              {step === 4
                ? createTask.isPending
                  ? "Creating..."
                  : "Create task ✓"
                : "Continue →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="text-xs font-medium text-text-primary">{value}</span>
    </div>
  );
}
