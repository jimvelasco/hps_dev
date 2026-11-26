import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../services/api";
import DashboardNavbar from "../../components/DashboardNavbar";
import { useHoa } from "../../context/HoaContext";
import { getAWSResource } from "../../utils/awsHelper";

export default function ConfigParams() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, fetchHoaById } = useHoa();
  const nextId = useRef(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setSaveError(null);
    setValidationError(null);
    setSuccess(null);

    axios.get(`/hoas/${hoaId}`)
      .then(({ data }) => {
        if (!cancelled) {
          setRows(Object.entries(data.config_params || {}).map(([key, value]) => ({
            id: nextId.current++, key, value: String(value)
          })));
        }
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.response?.data?.message || "Failed to load configuration parameters.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [hoaId, loadAttempt]);

  const clearFeedback = () => {
    setSaveError(null);
    setValidationError(null);
    setSuccess(null);
  };

  const handleChange = (id, field, value) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
    clearFeedback();
  };

  const handleSave = async () => {
    const entries = rows.map(({ key, value }) => [key.trim(), value]);
    const invalidIndex = entries.findIndex(([key]) => !/^[a-z][a-z0-9_]*$/.test(key) || ["constructor", "prototype"].includes(key));
    if (invalidIndex !== -1) {
      setValidationError(`Row ${invalidIndex + 1}: enter a lowercase key starting with a letter, using only letters, numbers, and underscores.`);
      return;
    }
    if (new Set(entries.map(([key]) => key)).size !== entries.length) {
      setValidationError("Each configuration key must be unique.");
      return;
    }
    const invalidValueIndex = entries.findIndex(([, value]) => value.trim() === "" || !Number.isFinite(Number(value)));
    if (invalidValueIndex !== -1) {
      setValidationError(`Row ${invalidValueIndex + 1}: enter a valid numeric value.`);
      return;
    }
    clearFeedback();
    setSaving(true);
    try {
      await axios.put(`/hoas/${hoaId}/config-params`, {
        config_params: Object.fromEntries(entries.map(([key, value]) => [key, Number(value)]))
      });
      setRows((current) => current.map((row) => ({ ...row, key: row.key.trim() })));
      setSuccess("Configuration parameters updated successfully.");
      await fetchHoaById(hoaId);
    } catch (error) {
      setSaveError(error.response?.data?.message || "Failed to save configuration parameters. Your changes have been kept; please try again.");
    } finally {
      setSaving(false);
    }
  };

  const backgroundImage = hoa ? getAWSResource(hoa, "BI") : "";
  const navButtons = [{ label: "Back", onClick: () => navigate(`/${hoaId}/admin`), which: "goback" }];

  return (
    <div className="standardlayout parking-types-page">
      {backgroundImage && <img className="parking-types-background" src={backgroundImage} alt="" />}
      <DashboardNavbar title="Config Params" title2={hoa && hoa.name} buttons={navButtons} />
      <main className="page-content">
        <div className="editable-table-container parking-types-container">
          <div className="editable-table-content">
            <h1 className="editable-table-title">Manage Configuration Parameters</h1>
            {loading ? <p role="status">Loading configuration parameters...</p> : loadError ? (
              <div className="editable-table-error" role="alert">
                <p>{loadError}</p>
                <button type="button" className="btn btn-primary" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Retry</button>
              </div>
            ) : (
              <>
                {saveError && <p className="editable-table-error" role="alert">{saveError}</p>}
                {validationError && <p className="editable-table-validation-error" role="alert">{validationError}</p>}
                {success && <p role="status">{success}</p>}
                <div className="editable-table-wrapper">
                  <table className="editable-table" aria-label="HOA configuration parameters" aria-busy={saving}>
                    <thead><tr><th scope="col">Key</th><th scope="col">Value</th><th scope="col">Action</th></tr></thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <input className="editable-table-input" aria-label="Configuration key" value={row.key}
                              disabled={saving} placeholder="onsite_button" onChange={(event) => handleChange(row.id, "key", event.target.value)} />
                          </td>
                          <td>
                            <input type="number" step="any" className="editable-table-input"
                              aria-label={`Value for ${row.key || "new parameter"}`}
                              value={row.value} disabled={saving}
                              onChange={(event) => handleChange(row.id, "value", event.target.value)} />
                          </td>
                          <td>
                            <button type="button" className="btn btn-primary" disabled={saving} onClick={() => {
                              setRows((current) => current.filter((item) => item.id !== row.id));
                              clearFeedback();
                            }}>Remove</button>
                          </td>
                        </tr>
                      ))}
                      {rows.length === 0 && <tr><td colSpan={3}>No configuration parameters yet. Add one to get started.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="button-grid">
                  <button type="button" className="btn btn-primary" disabled={saving} onClick={() => {
                    setRows((current) => [...current, { id: nextId.current++, key: "", value: "0" }]);
                    clearFeedback();
                  }}>+ Add Parameter</button>
                  <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>
                    {saving ? "Saving..." : "Save All Changes"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
