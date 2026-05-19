import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  mockModules,
  mockSections,
  mockTaskTypes,
  mockUsers,
} from "@guaro/mock-data";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { TEAM_LABELS } from "@guaro/utils";
import { Plus, Trash2, GripVertical, X } from "lucide-react";
import type { TaskType } from "@guaro/types";

type Tab = "general" | "form" | "workflow" | "assignment";

export function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [selectedTaskTypeId, setSelectedTaskTypeId] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [saved, setSaved] = useState(false);
  const [showNewTaskType, setShowNewTaskType] = useState(false);
  const [newTaskTypeName, setNewTaskTypeName] = useState("");
  const [newTaskTypeMode, setNewTaskTypeMode] = useState<
    "AUTOMATED" | "MANUAL" | "HYBRID"
  >("AUTOMATED");
  const [newTaskTypeSectionId, setNewTaskTypeSectionId] = useState("");

  const module = mockModules.find((m) => m.id === moduleId);
  const sections = mockSections.filter((s) => s.moduleId === moduleId);
  const allTaskTypes = mockTaskTypes.filter((tt) =>
    sections.some((s) => s.id === tt.sectionId),
  );
  const selectedTaskType = allTaskTypes.find(
    (tt) => tt.id === selectedTaskTypeId,
  );

  useEffect(() => {
    const el = document.getElementById("page-title");
    if (el)
      el.textContent = module ? `${module.name} — Task types` : "Module config";
    if (allTaskTypes.length > 0 && !selectedTaskTypeId) {
      setSelectedTaskTypeId(allTaskTypes[0].id);
    }
    if (sections.length > 0 && !newTaskTypeSectionId) {
      setNewTaskTypeSectionId(sections[0].id);
    }
  }, [module, moduleId]);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!module) {
    return (
      <div className="p-5 text-center text-text-tertiary">Module not found</div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel */}
      <div className="w-56 flex-shrink-0 border-r border-border flex flex-col bg-white">
        <div className="flex items-center justify-between px-3 py-3 border-b border-border">
          <p className="section-label">Task types</p>
          <span className="text-[10px] text-text-tertiary">
            {allTaskTypes.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sections.map((sec) => (
            <div key={sec.id}>
              <div className="px-3 py-2 bg-surface-secondary border-b border-border">
                <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide">
                  {sec.name}
                </p>
              </div>
              {allTaskTypes
                .filter((tt) => tt.sectionId === sec.id)
                .map((tt) => (
                  <button
                    key={tt.id}
                    onClick={() => {
                      setSelectedTaskTypeId(tt.id);
                      setActiveTab("general");
                    }}
                    className={`w-full text-left px-3 py-2.5 border-b border-border
                                transition-colors hover:bg-surface-secondary ${
                                  selectedTaskTypeId === tt.id
                                    ? "bg-surface-secondary border-l-2 border-l-accent"
                                    : ""
                                }`}
                  >
                    <p
                      className={`text-xs font-medium truncate ${
                        selectedTaskTypeId === tt.id
                          ? "text-text-primary"
                          : "text-text-secondary"
                      }`}
                    >
                      {tt.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge status={tt.executionMode} />
                      <span className="text-[10px] text-text-tertiary">
                        w:{tt.estimatedWeight}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-border">
          <button
            className="btn btn-secondary btn-sm w-full"
            onClick={() => setShowNewTaskType(true)}
          >
            <Plus size={12} />
            New task type
          </button>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto">
        {!selectedTaskType ? (
          <div className="flex items-center justify-center h-full text-text-tertiary text-sm">
            Select a task type to configure
          </div>
        ) : (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-text-primary">
                  {selectedTaskType.name}
                </h2>
                <Badge status={selectedTaskType.executionMode} />
                <span className="badge badge-success">Active</span>
              </div>
              <div className="flex gap-2">
                <button
                  className={`btn btn-sm ${saved ? "btn-secondary text-success-text" : "btn-primary"}`}
                  onClick={handleSave}
                >
                  {saved ? "Saved!" : "Save changes"}
                </button>
                <button className="btn btn-danger btn-sm">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="flex border-b border-border px-4">
                {(["general", "form", "workflow", "assignment"] as Tab[]).map(
                  (t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors
                                -mb-px capitalize ${
                                  activeTab === t
                                    ? "border-accent text-text-primary"
                                    : "border-transparent text-text-secondary hover:text-text-primary"
                                }`}
                    >
                      {t === "form"
                        ? "Form fields"
                        : t === "assignment"
                          ? "Assignment"
                          : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ),
                )}
              </div>
              <div className="p-4">
                {activeTab === "general" && (
                  <GeneralTab taskType={selectedTaskType} />
                )}
                {activeTab === "form" && (
                  <FormTab taskType={selectedTaskType} />
                )}
                {activeTab === "workflow" && (
                  <WorkflowTab taskType={selectedTaskType} />
                )}
                {activeTab === "assignment" && (
                  <AssignmentTab taskType={selectedTaskType} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New task type modal */}
      {showNewTaskType && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-modal w-80 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">
                New task type
              </h3>
              <button onClick={() => setShowNewTaskType(false)}>
                <X size={16} className="text-text-secondary" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  Name <span className="text-danger-text">*</span>
                </label>
                <input
                  className="input w-full"
                  placeholder="e.g. Upload stock"
                  value={newTaskTypeName}
                  onChange={(e) => setNewTaskTypeName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  Section <span className="text-danger-text">*</span>
                </label>
                <select
                  className="select w-full"
                  value={newTaskTypeSectionId}
                  onChange={(e) => setNewTaskTypeSectionId(e.target.value)}
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1.5">
                  Execution mode <span className="text-danger-text">*</span>
                </label>
                <select
                  className="select w-full"
                  value={newTaskTypeMode}
                  onChange={(e) =>
                    setNewTaskTypeMode(e.target.value as typeof newTaskTypeMode)
                  }
                >
                  <option value="AUTOMATED">Automated</option>
                  <option value="MANUAL">Manual</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowNewTaskType(false);
                  setNewTaskTypeName("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                disabled={!newTaskTypeName.trim()}
                onClick={() => {
                  setShowNewTaskType(false);
                  setNewTaskTypeName("");
                }}
              >
                Create task type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// GENERAL TAB
// ─────────────────────────────────────────

function GeneralTab({ taskType }: { taskType: TaskType }) {
  return (
    <div className="space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">
            Task type name
          </label>
          <input className="input w-full" defaultValue={taskType.name} />
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">
            Execution mode
          </label>
          <select
            className="select w-full"
            defaultValue={taskType.executionMode}
          >
            <option value="AUTOMATED">Automated</option>
            <option value="MANUAL">Manual</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-text-secondary block mb-1.5">
          Description
        </label>
        <input
          className="input w-full"
          defaultValue={taskType.description ?? ""}
          placeholder="Brief description shown when creating tasks..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">
            Weight{" "}
            <span className="text-text-tertiary font-normal">
              (BPO load unit)
            </span>
          </label>
          <input
            type="number"
            className="input w-full"
            defaultValue={taskType.estimatedWeight}
            min={1}
            max={10}
          />
          <p className="text-[11px] text-text-tertiary mt-1">
            Heavier tasks count more toward BPO capacity.
          </p>
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">
            SLA <span className="text-text-tertiary font-normal">(hours)</span>
          </label>
          <input
            type="number"
            className="input w-full"
            defaultValue={taskType.slaHours}
            min={1}
          />
          <p className="text-[11px] text-text-tertiary mt-1">
            Sets the ETA shown on task creation.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">
            Max concurrent per BPO
          </label>
          <input
            type="number"
            className="input w-full"
            defaultValue={taskType.maxConcurrentPerBpo}
            min={1}
            max={10}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">
            Retry attempts
          </label>
          <input
            type="number"
            className="input w-full"
            defaultValue={taskType.retryAttempts}
            min={0}
            max={5}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// FORM TAB
// ─────────────────────────────────────────

function FormTab({ taskType }: { taskType: TaskType }) {
  const [fields, setFields] = useState([
    {
      id: "f-brand",
      name: "Brand",
      type: "brand_select",
      required: true,
      locked: false,
      options: [] as string[],
    },
    {
      id: "f-scope",
      name: "Stores scope",
      type: "select",
      required: true,
      locked: false,
      options: ["All stores", "Select specific stores"],
    },
    {
      id: "f-priority",
      name: "Priority",
      type: "select",
      required: false,
      locked: false,
      options: ["Normal", "High", "Urgent"],
    },
    ...(taskType.executionMode !== "MANUAL"
      ? [
          {
            id: "f-file",
            name: "Data file",
            type: "file / sheet link",
            required: true,
            locked: false,
            options: [] as string[],
          },
        ]
      : []),
    {
      id: "f-notes",
      name: "Notes",
      type: "textarea",
      required: false,
      locked: false,
      options: [] as string[],
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function removeField(id: string) {
    setFields((f) => f.filter((x) => x.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function updateField(id: string, key: string, value: unknown) {
    setFields((f) => f.map((x) => (x.id === id ? { ...x, [key]: value } : x)));
  }

  function addOption(fieldId: string, option: string) {
    if (!option.trim()) return;
    setFields((f) =>
      f.map((x) =>
        x.id === fieldId ? { ...x, options: [...x.options, option.trim()] } : x,
      ),
    );
  }

  function removeOption(fieldId: string, idx: number) {
    setFields((f) =>
      f.map((x) =>
        x.id === fieldId
          ? { ...x, options: x.options.filter((_, i) => i !== idx) }
          : x,
      ),
    );
  }

  function addField() {
    if (!newFieldName.trim()) return;
    setFields((f) => [
      ...f,
      {
        id: `f-${Date.now()}`,
        name: newFieldName,
        type: newFieldType,
        required: false,
        locked: false,
        options: [],
      },
    ]);
    setNewFieldName("");
    setShowAddField(false);
  }

  function onDragStart(i: number) {
    setDragIndex(i);
  }

  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    setDragOverIndex(i);
  }

  function onDrop(i: number) {
    if (dragIndex === null || dragIndex === i) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...fields];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(i, 0, moved);
    setFields(reordered);
    setDragIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div className="max-w-lg">
      <p className="text-xs text-text-secondary mb-3">
        Fields shown in the task creation form. Drag to reorder.
      </p>

      <div className="space-y-1.5 mb-4">
        {fields.map((f, i) => (
          <div
            key={f.id}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => onDragOver(e, i)}
            onDrop={() => onDrop(i)}
            onDragEnd={() => {
              setDragIndex(null);
              setDragOverIndex(null);
            }}
            className={`border rounded-md transition-all ${
              dragOverIndex === i && dragIndex !== i
                ? "border-accent bg-info-bg"
                : "border-border bg-white hover:bg-surface-secondary"
            }`}
          >
            {/* Field row */}
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <GripVertical
                size={14}
                className="text-text-tertiary flex-shrink-0 cursor-grab"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-text-primary">
                  {f.name}
                </span>
                {f.type === "brand_select" && (
                  <span
                    className="ml-1.5 text-[10px] bg-purple-bg text-purple-text
                                   rounded px-1.5 py-0.5"
                  >
                    auto-added
                  </span>
                )}
              </div>
              <span
                className="text-[10px] text-text-tertiary bg-surface-secondary
                              border border-border rounded px-1.5 py-0.5 flex-shrink-0"
              >
                {f.type}
              </span>
              <button
                className={`text-[10px] flex-shrink-0 px-1.5 py-0.5 rounded border
                            transition-colors ${
                              f.required
                                ? "text-danger-text border-danger-border bg-danger-bg hover:opacity-70"
                                : "text-text-tertiary border-border hover:bg-surface-secondary"
                            }`}
                onClick={() => updateField(f.id, "required", !f.required)}
                title="Click to toggle required/optional"
              >
                {f.required ? "required" : "optional"}
              </button>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  className={`btn btn-ghost btn-sm p-1 ${
                    editingId === f.id ? "text-accent" : "text-text-tertiary"
                  }`}
                  onClick={() => setEditingId(editingId === f.id ? null : f.id)}
                  title="Edit field"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  className="btn btn-ghost btn-sm p-1 text-text-tertiary hover:text-danger-text"
                  onClick={() => removeField(f.id)}
                  title="Remove field"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Edit panel */}
            {editingId === f.id && (
              <div
                className="border-t border-border px-3 pb-3 pt-2.5 space-y-3
                              bg-surface-secondary/30"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-text-secondary block mb-1">
                      Label
                    </label>
                    <input
                      className="input w-full"
                      value={f.name}
                      onChange={(e) =>
                        updateField(f.id, "name", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-text-secondary block mb-1">
                      Type
                    </label>
                    <select
                      className="select w-full"
                      value={f.type}
                      onChange={(e) =>
                        updateField(f.id, "type", e.target.value)
                      }
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="select">Select</option>
                      <option value="number">Number</option>
                      <option value="file / sheet link">
                        File / Sheet link
                      </option>
                      <option value="date">Date</option>
                      <option value="brand_select">Brand select</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) =>
                      updateField(f.id, "required", e.target.checked)
                    }
                  />
                  <span className="text-xs text-text-primary">
                    Required field
                  </span>
                </label>

                {f.type === "select" && (
                  <div>
                    <label className="text-[10px] font-medium text-text-secondary block mb-1.5">
                      Options
                    </label>
                    <div className="space-y-1 mb-2">
                      {f.options.map((opt, idx) => (
                        <OptionRow
                          key={idx}
                          value={opt}
                          onChange={(val) => {
                            setFields((fs) =>
                              fs.map((x) =>
                                x.id === f.id
                                  ? {
                                      ...x,
                                      options: x.options.map((o, i) =>
                                        i === idx ? val : o,
                                      ),
                                    }
                                  : x,
                              ),
                            );
                          }}
                          onRemove={() => removeOption(f.id, idx)}
                        />
                      ))}
                      {f.options.length === 0 && (
                        <p className="text-[10px] text-text-tertiary">
                          No options yet
                        </p>
                      )}
                    </div>
                    <AddOptionRow onAdd={(opt) => addOption(f.id, opt)} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddField ? (
        <div className="border border-border rounded-md p-3 space-y-2 mb-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">
                Field name
              </label>
              <input
                className="input w-full"
                placeholder="e.g. SKU list"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">
                Field type
              </label>
              <select
                className="select w-full"
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value)}
              >
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="select">Select</option>
                <option value="number">Number</option>
                <option value="file / sheet link">File / Sheet link</option>
                <option value="date">Date</option>
                <option value="brand_select">Brand select</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setShowAddField(false);
                setNewFieldName("");
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary btn-sm"
              disabled={!newFieldName.trim()}
              onClick={addField}
            >
              Add field
            </button>
          </div>
        </div>
      ) : (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowAddField(true)}
        >
          <Plus size={12} />
          Add field
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// OPTION ROW
// ─────────────────────────────────────────

function OptionRow({
  value,
  onChange,
  onRemove,
}: {
  value: string;
  onChange: (val: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function save() {
    if (draft.trim()) onChange(draft.trim());
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-1.5">
      {editing ? (
        <>
          <input
            className="input flex-1 input-sm"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setDraft(value);
                setEditing(false);
              }
            }}
            autoFocus
          />
          <button
            className="btn btn-primary btn-sm flex-shrink-0"
            onClick={save}
          >
            Save
          </button>
          <button
            className="btn btn-ghost btn-sm flex-shrink-0"
            onClick={() => {
              setDraft(value);
              setEditing(false);
            }}
          >
            <X size={11} />
          </button>
        </>
      ) : (
        <>
          <div
            className="flex-1 text-xs bg-white border border-border rounded px-2.5 py-1.5
                        cursor-pointer hover:border-accent hover:bg-surface-secondary transition-colors"
            onClick={() => setEditing(true)}
          >
            {value}
          </div>
          <button
            className="btn btn-ghost btn-sm p-1 text-text-tertiary hover:text-accent"
            onClick={() => setEditing(true)}
            title="Edit"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className="btn btn-ghost btn-sm p-1 text-text-tertiary hover:text-danger-text"
            onClick={onRemove}
            title="Remove"
          >
            <X size={11} />
          </button>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// ADD OPTION ROW
// ─────────────────────────────────────────

function AddOptionRow({ onAdd }: { onAdd: (opt: string) => void }) {
  const [value, setValue] = useState("");

  function submit() {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
  }

  return (
    <div className="flex gap-1.5">
      <input
        className="input flex-1 input-sm"
        placeholder="Add option..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button
        className="btn btn-secondary btn-sm flex-shrink-0"
        disabled={!value.trim()}
        onClick={submit}
      >
        <Plus size={11} />
        Add
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// WORKFLOW TAB
// ─────────────────────────────────────────

function WorkflowTab({ taskType }: { taskType: TaskType }) {
  const defaultNodes =
    taskType.executionMode === "AUTOMATED"
      ? [
          {
            id: "w1",
            label: "Read file",
            type: "auto",
            sub: "Downloads & parses input",
          },
          {
            id: "w2",
            label: "Validate rows",
            type: "auto",
            sub: "Schema + data check",
          },
          {
            id: "w3",
            label: "Upload via API",
            type: "auto",
            sub: "Calls platform API",
          },
          {
            id: "w4",
            label: "Notify result",
            type: "auto",
            sub: "Sends webhook",
          },
        ]
      : taskType.executionMode === "HYBRID"
        ? [
            {
              id: "w1",
              label: "Create in Guaro",
              type: "auto",
              sub: "Registers brand",
            },
            {
              id: "w2",
              label: "BPO creates externally",
              type: "manual",
              sub: "Platform action",
            },
            {
              id: "w3",
              label: "BPO fills external ID",
              type: "manual",
              sub: "Registers ID & app",
            },
            {
              id: "w4",
              label: "Assign OP",
              type: "auto",
              sub: "Round robin / fixed",
            },
            {
              id: "w5",
              label: "Notify result",
              type: "auto",
              sub: "Sends webhook",
            },
          ]
        : [
            {
              id: "w1",
              label: "Assigned to BPO",
              type: "auto",
              sub: "Weight balanced",
            },
            {
              id: "w2",
              label: "BPO executes",
              type: "manual",
              sub: "Manual action",
            },
            {
              id: "w3",
              label: "Notify result",
              type: "auto",
              sub: "Sends webhook",
            },
          ];

  const [nodes, setNodes] = useState(defaultNodes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<"auto" | "manual">("auto");
  const [newSub, setNewSub] = useState("");

  function updateNode(id: string, field: string, value: string) {
    setNodes((ns) =>
      ns.map((n) => (n.id === id ? { ...n, [field]: value } : n)),
    );
  }

  function removeNode(id: string) {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function addNode() {
    if (!newLabel.trim()) return;
    setNodes((ns) => [
      ...ns,
      {
        id: `w${Date.now()}`,
        label: newLabel,
        type: newType,
        sub: newSub,
      },
    ]);
    setNewLabel("");
    setNewSub("");
    setShowAdd(false);
  }

  return (
    <div>
      <p className="text-xs text-text-secondary mb-4">
        Steps executed when this task is triggered. Click a node to edit.
      </p>
      <div className="flex flex-col items-center gap-0 mb-4">
        {nodes.map((node, i) => (
          <div
            key={node.id}
            className="flex flex-col items-center w-full max-w-xs"
          >
            {editingId === node.id ? (
              <div className="w-full border border-accent rounded-md p-3 bg-white shadow-card">
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-medium text-text-secondary block mb-1">
                      Label
                    </label>
                    <input
                      className="input w-full"
                      value={node.label}
                      onChange={(e) =>
                        updateNode(node.id, "label", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-text-secondary block mb-1">
                      Type
                    </label>
                    <select
                      className="select w-full"
                      value={node.type}
                      onChange={(e) =>
                        updateNode(node.id, "type", e.target.value)
                      }
                    >
                      <option value="auto">Automated</option>
                      <option value="manual">Manual (BPO)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-text-secondary block mb-1">
                      Description
                    </label>
                    <input
                      className="input w-full"
                      value={node.sub}
                      onChange={(e) =>
                        updateNode(node.id, "sub", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex gap-2 justify-between">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeNode(node.id)}
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setEditingId(null)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`px-4 py-2 rounded-md border text-xs text-center
                            min-w-[180px] cursor-pointer transition-colors hover:opacity-80 ${
                              node.type === "auto"
                                ? "bg-purple-bg border-purple-border text-purple-text"
                                : "bg-surface-secondary border-border text-text-secondary"
                            }`}
                onClick={() => setEditingId(node.id)}
              >
                <p className="font-medium">{node.label}</p>
                <p className="text-[10px] mt-0.5 opacity-75">{node.sub}</p>
              </div>
            )}
            {i < nodes.length - 1 && <div className="w-px h-4 bg-border" />}
          </div>
        ))}
      </div>

      {showAdd ? (
        <div className="border border-border rounded-md p-3 max-w-xs space-y-2 mb-2">
          <div>
            <label className="text-[10px] font-medium text-text-secondary block mb-1">
              Label
            </label>
            <input
              className="input w-full"
              placeholder="e.g. Send notification"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-text-secondary block mb-1">
              Type
            </label>
            <select
              className="select w-full"
              value={newType}
              onChange={(e) => setNewType(e.target.value as "auto" | "manual")}
            >
              <option value="auto">Automated</option>
              <option value="manual">Manual (BPO)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-medium text-text-secondary block mb-1">
              Description
            </label>
            <input
              className="input w-full"
              placeholder="Short description..."
              value={newSub}
              onChange={(e) => setNewSub(e.target.value)}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary btn-sm"
              disabled={!newLabel.trim()}
              onClick={addNode}
            >
              Add node
            </button>
          </div>
        </div>
      ) : (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowAdd(true)}
        >
          <Plus size={12} />
          Add node
        </button>
      )}

      <div className="mt-3 flex gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-purple-bg border border-purple-border" />
          <span className="text-[10px] text-text-secondary">Automated</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-surface-secondary border border-border" />
          <span className="text-[10px] text-text-secondary">Manual (BPO)</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// ASSIGNMENT TAB
// ─────────────────────────────────────────

function AssignmentTab({ taskType }: { taskType: TaskType }) {
  const [strategy, setStrategy] = useState(taskType.assignmentStrategy);
  const bpoUsers = mockUsers.filter((u) => u.role === "BPO");
  const [weightPool, setWeightPool] = useState<string[]>(
    bpoUsers.map((u) => u.id),
  );
  const [fixedPool, setFixedPool] = useState<string[]>([]);
  const [roundPool, setRoundPool] = useState<string[]>([]);

  function toggleWeight(id: string) {
    setWeightPool((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  }

  function toggleFixed(id: string) {
    setFixedPool((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  }

  function toggleRound(id: string) {
    setRoundPool((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  }

  function BpoPoolList({
    selected,
    onToggle,
  }: {
    selected: string[];
    onToggle: (id: string) => void;
  }) {
    return (
      <div className="border border-border rounded-md divide-y divide-border">
        {bpoUsers.map((u) => (
          <label
            key={u.id}
            className="flex items-center gap-2.5 px-3 py-2 cursor-pointer
                       hover:bg-surface-secondary"
          >
            <input
              type="checkbox"
              checked={selected.includes(u.id)}
              onChange={() => onToggle(u.id)}
            />
            <Avatar name={u.name} size="xs" />
            <span className="text-xs text-text-primary">{u.name}</span>
            <span className="text-[10px] text-text-tertiary ml-auto">
              {TEAM_LABELS[u.team]}
            </span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <label className="text-xs font-medium text-text-secondary block mb-1.5">
          Assignment strategy
        </label>
        <select
          className="select w-full"
          value={strategy}
          onChange={(e) => setStrategy(e.target.value as typeof strategy)}
        >
          <option value="WEIGHT_BALANCED">
            Weight balanced — least loaded BPO
          </option>
          <option value="FIXED_BPO">Fixed — always same BPO(s)</option>
          <option value="ROUND_ROBIN">Round robin — rotate between BPOs</option>
          <option value="KA_TYPE_BASED">
            KA type based — fixed for KA, round robin for CKA/SME
          </option>
        </select>
      </div>

      {strategy === "WEIGHT_BALANCED" && (
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">
            Eligible BPO pool{" "}
            <span className="text-text-tertiary font-normal">
              — task goes to least loaded among these
            </span>
          </label>
          <BpoPoolList selected={weightPool} onToggle={toggleWeight} />
          {weightPool.length === 0 && (
            <p className="text-[11px] text-warning-text mt-1">
              Select at least one BPO
            </p>
          )}
          <p className="text-[11px] text-text-tertiary mt-1">
            Among selected BPOs, the one with least active weight gets assigned.
          </p>
        </div>
      )}

      {strategy === "FIXED_BPO" && (
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">
            Fixed BPO(s){" "}
            <span className="text-text-tertiary font-normal">
              — task always goes to these
            </span>
          </label>
          <BpoPoolList selected={fixedPool} onToggle={toggleFixed} />
          {fixedPool.length === 0 && (
            <p className="text-[11px] text-warning-text mt-1">
              Select at least one BPO
            </p>
          )}
        </div>
      )}

      {strategy === "ROUND_ROBIN" && (
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">
            BPO pool{" "}
            <span className="text-text-tertiary font-normal">
              — rotate between these
            </span>
          </label>
          <BpoPoolList selected={roundPool} onToggle={toggleRound} />
          {roundPool.length === 0 && (
            <p className="text-[11px] text-warning-text mt-1">
              Select at least one BPO
            </p>
          )}
        </div>
      )}

      {strategy === "KA_TYPE_BASED" && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1.5">
              Fixed BPO(s){" "}
              <span className="text-text-tertiary font-normal">
                — for KA brands
              </span>
            </label>
            <BpoPoolList selected={fixedPool} onToggle={toggleFixed} />
            {fixedPool.length === 0 && (
              <p className="text-[11px] text-warning-text mt-1">
                Select at least one BPO for KA brands
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1.5">
              Round robin pool{" "}
              <span className="text-text-tertiary font-normal">
                — for CKA/SME brands
              </span>
            </label>
            <BpoPoolList selected={roundPool} onToggle={toggleRound} />
            {roundPool.length === 0 && (
              <p className="text-[11px] text-warning-text mt-1">
                Select at least one BPO for CKA/SME brands
              </p>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-text-secondary block mb-1.5">
          Webhook events
        </label>
        <div className="space-y-2">
          {[
            {
              key: "TASK_CREATED",
              label: "task.created",
              desc: "When task is created",
            },
            {
              key: "TASK_COMPLETED",
              label: "task.completed",
              desc: "When task completes",
            },
            {
              key: "TASK_FAILED",
              label: "task.failed",
              desc: "When worker fails after retries",
            },
            {
              key: "TASK_BLOCKED",
              label: "task.blocked",
              desc: "When BPO reports a block",
            },
          ].map((ev) => (
            <label
              key={ev.key}
              className="flex items-start gap-2.5 cursor-pointer"
            >
              <input
                type="checkbox"
                className="mt-0.5"
                defaultChecked={[
                  "TASK_COMPLETED",
                  "TASK_BLOCKED",
                  "TASK_FAILED",
                ].includes(ev.key)}
              />
              <div>
                <p className="text-xs font-medium text-text-primary">
                  {ev.label}
                </p>
                <p className="text-[10px] text-text-tertiary">{ev.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-text-secondary block mb-1.5">
          Auto-retry on failure
        </label>
        <select className="select w-full">
          <option>3 retries · 5 min backoff</option>
          <option>1 retry · immediate</option>
          <option>No retry — fail immediately</option>
        </select>
        <p className="text-[11px] text-text-tertiary mt-1">
          Only applies to Automated and Hybrid tasks.
        </p>
      </div>
    </div>
  );
}
