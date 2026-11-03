import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import axios from "../../services/api";
import DashboardNavbar from "../../components/DashboardNavbar";
import { useHoa } from "../../context/HoaContext";
import { getAWSResource } from "../../utils/awsHelper";

function SortableParkingTypeRow({ row, editCell, saving, onEdit, onChange, onEndEdit, onCancelEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging, isOver } = useSortable({
    id: row.id,
    disabled: saving,
  });

  return (
    <tr ref={setNodeRef} className={`${isDragging ? "parking-types-dragging" : ""} ${isOver ? "parking-types-drop-target" : ""}`}>
      <td>
        <button
          type="button"
          className="parking-types-drag-handle"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${row.label || row.value || "parking type"}`}
          disabled={saving}
        >
          <span aria-hidden="true">≡</span>
        </button>
      </td>
      {["value", "label"].map((field) => (
        <td key={field}>
          {editCell?.id === row.id && editCell.field === field ? (
            <input
              type="text"
              className="editable-table-input"
              aria-label={`Parking type ${field}`}
              autoFocus
              value={row[field]}
              disabled={saving}
              onChange={(event) => onChange(row.id, field, event.target.value)}
              onBlur={onEndEdit}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onEndEdit();
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  onCancelEdit();
                }
              }}
            />
          ) : (
            <button
              type="button"
              className={`parking-types-cell editable-table-cell-text ${row[field] ? "filled" : "empty"}`}
              onClick={() => onEdit(row.id, field, row[field])}
              disabled={saving}
              aria-label={`Edit parking type ${field}: ${row[field] || "empty"}`}
            >
              {row[field] || "(click to edit)"}
            </button>
          )}
        </td>
      ))}
      <td>
        <button type="button" className="editable-table-delete-button" onClick={() => onDelete(row.id)} disabled={saving}>
          Delete
        </button>
      </td>
    </tr>
  );
}

export default function ParkingTypes() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, fetchHoaById } = useHoa();
  const nextId = useRef(0);
  const saveInProgress = useRef(false);
  const [rows, setRows] = useState([]);
  const [editCell, setEditCell] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setSaveError(null);
    setSuccess(null);
    setValidationError(null);
    setEditCell(null);
    setActiveId(null);
    axios.get(`/hoas/${hoaId}`)
      .then(({ data }) => {
        if (!cancelled) {
          setRows((data.parking_types_array || []).map((entry) => ({
            id: `parking-type-${nextId.current++}`,
            value: entry.value || "",
            label: entry.label || "",
          })));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(error.response?.data?.message || "Failed to load parking types.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [hoaId, loadAttempt]);

  const clearFeedback = () => {
    setValidationError(null);
    setSaveError(null);
    setSuccess(null);
  };

  const handleChange = (id, field, value) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
    clearFeedback();
  };

  const handleCancelEdit = () => {
    if (editCell) handleChange(editCell.id, editCell.field, editCell.original);
    setEditCell(null);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id || saving) return;
    setRows((current) => {
      const oldIndex = current.findIndex((row) => row.id === active.id);
      const newIndex = current.findIndex((row) => row.id === over.id);
      return oldIndex < 0 || newIndex < 0 ? current : arrayMove(current, oldIndex, newIndex);
    });
    clearFeedback();
  };

  const handleSaveAll = async () => {
    if (saveInProgress.current) return;
    setEditCell(null);
    clearFeedback();
    const parkingTypes = rows.map(({ value, label }) => ({ value: value.trim(), label: label.trim() }));
    const invalidIndex = parkingTypes.findIndex((row) => !row.value || !row.label);
    if (invalidIndex !== -1) {
      setValidationError(`Row ${invalidIndex + 1}: value and label are required. Complete or delete this row before saving.`);
      return;
    }
    const values = parkingTypes.map((row) => row.value);
    if (new Set(values).size !== values.length) {
      setValidationError("Each parking type must have a unique value.");
      return;
    }

    saveInProgress.current = true;
    setSaving(true);
    try {
      await axios.put(`/hoas/${hoaId}`, { parking_types_array: parkingTypes });
      const refreshedHoa = await fetchHoaById(hoaId);
      if (!refreshedHoa) {
        setSaveError("Parking types were saved, but HOA data could not be refreshed. Save again to retry the refresh.");
        return;
      }
      setRows((current) => current.map((row, index) => ({ ...row, ...parkingTypes[index] })));
      setSuccess("Parking types updated successfully.");
    } catch (error) {
      setSaveError(error.response?.data?.message || "Failed to save parking types. Your changes have been kept; please try again.");
    } finally {
      saveInProgress.current = false;
      setSaving(false);
    }
  };

  const backgroundImage = hoa ? getAWSResource(hoa, "BI") : "";
  const activeRow = rows.find((row) => row.id === activeId);
  const navButtons = [{ label: "Back", onClick: () => navigate(`/${hoaId}/admin`), which: "goback" }];

  return (
    <div className="standardlayout parking-types-page">
      {backgroundImage && <img className="parking-types-background" src={backgroundImage} alt="" />}
      <DashboardNavbar title="Parking Types" title2={hoa && hoa.name} buttons={navButtons} />
      <main className="page-content">
        <div className="editable-table-container parking-types-container">
          <div className="editable-table-content">
            <h1 className="editable-table-title">Manage Parking Types</h1>
            {loading ? <p role="status">Loading parking types...</p> : loadError ? (
              <div className="editable-table-error" role="alert">
                <p>{loadError}</p>
                <button type="button" className="btn btn-primary" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Retry</button>
              </div>
            ) : (
              <>
                {saveError && <p className="editable-table-error" role="alert">{saveError}</p>}
                {validationError && <p className="editable-table-validation-error" role="alert">{validationError}</p>}
                {success && <p role="status">{success}</p>}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={({ active }) => { setEditCell(null); setActiveId(active.id); }}
                  onDragEnd={handleDragEnd}
                  onDragCancel={() => setActiveId(null)}
                >
                  <div className="editable-table-wrapper">
                    <table className="editable-table" aria-label="Parking types" aria-busy={saving}>
                      <thead><tr><th scope="col">Order</th><th scope="col">Value</th><th scope="col">Label</th><th scope="col">Action</th></tr></thead>
                      <tbody>
                        <SortableContext items={rows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
                          {rows.map((row) => (
                            <SortableParkingTypeRow
                              key={row.id}
                              row={row}
                              editCell={editCell}
                              saving={saving}
                              onEdit={(id, field, original) => setEditCell({ id, field, original })}
                              onChange={handleChange}
                              onEndEdit={() => setEditCell(null)}
                              onCancelEdit={handleCancelEdit}
                              onDelete={(id) => {
                                setRows((current) => current.filter((item) => item.id !== id));
                                setEditCell(null);
                                clearFeedback();
                              }}
                            />
                          ))}
                        </SortableContext>
                        {rows.length === 0 && <tr><td colSpan={4}>No parking types configured. Add a row to get started.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  <DragOverlay>{activeRow ? <div className="ajaxloader">{activeRow.value || "New parking type"} — {activeRow.label}</div> : null}</DragOverlay>
                </DndContext>
                <div className="button-grid">
                  <button type="button" className="btn btn-primary" disabled={saving || !!activeId} onClick={() => {
                    const id = `parking-type-${nextId.current++}`;
                    setRows((current) => [...current, { id, value: "", label: "" }]);
                    clearFeedback();
                  }}>+ Add Row</button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveAll} disabled={saving || !!activeId}>
                    {saving ? "Saving..." : "Save All Changes"}
                  </button>
                </div>
                <div className="editable-table-instructions">
                  <h3>Instructions:</h3>
                  <ul>
                    <li>Drag the order handle to reorder parking types, or focus it and press Space, arrow keys, then Space to drop.</li>
                    <li>Click a value or label to edit. Press Enter to finish or Escape to cancel the current cell edit.</li>
                    <li>Both fields are required, and each value must be unique.</li>
                    <li>Changes, including deletions and row order, apply only after saving. Delete all rows and save to clear the list.</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
