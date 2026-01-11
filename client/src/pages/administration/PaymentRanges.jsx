import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/api";
import DashboardNavbar from "../../components/DashboardNavbar";
import ModalAlert from "../../components/ModalAlert";


export default function PaymentRanges() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const [ranges, setRanges] = useState([]);
  const [editCell, setEditCell] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null, onCancel: null });


  useEffect(() => {
    fetchPaymentRanges();
  }, [hoaId]);

  const fetchPaymentRanges = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/hoas/${hoaId}`);
      const hoaData = response.data;
      console.log('hoaData:', hoaData);
      const paymentRanges = hoaData.payment_ranges || [];

      if (paymentRanges.length === 0) {
        setRanges([{
          _id: `temp-0`,
          startDayMo: "",
          endDayMo: "",
          rate: "",
          description: ""
        }]);
      } else {
        setRanges(paymentRanges);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load payment ranges");
      console.error("Error fetching payment ranges:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkOverlap = (rangesArray) => {
    const filledRanges = rangesArray.filter(r => r.startDayMo && r.endDayMo);

    for (let i = 0; i < filledRanges.length; i++) {
      for (let j = i + 1; j < filledRanges.length; j++) {
        const r1 = filledRanges[i];
        const r2 = filledRanges[j];

        if (!(r1.endDayMo < r2.startDayMo || r2.endDayMo < r1.startDayMo)) {
          return {
            hasOverlap: true,
            message: `Date range overlap detected: ${r1.startDayMo}-${r1.endDayMo} overlaps with ${r2.startDayMo}-${r2.endDayMo}`
          };
        }
      }
    }
    return { hasOverlap: false };
  };

  const handleCellClick = (rowIndex, field) => {
    setEditCell({ rowIndex, field });
    setTempValue(ranges[rowIndex][field] || "");
    setValidationError(null);
  };

  const handleSave = (rowIndex, field) => {
    const updated = [...ranges];
    updated[rowIndex][field] = tempValue;

    if (field === "startDayMo" || field === "endDayMo") {
      const dateRegex = /^\d{2}-\d{2}$/;
      if (tempValue && !dateRegex.test(tempValue)) {
        setValidationError("Date format must be MM-DD (e.g., 01-15)");
        return;
      }
    }

    if (field === "rate" && tempValue) {
      const rateNum = parseFloat(tempValue);
      if (isNaN(rateNum) || rateNum < 0) {
        setValidationError("Rate must be a positive number");
        return;
      }
    }

    const overlapCheck = checkOverlap(updated);
    if (overlapCheck.hasOverlap) {
      setValidationError(overlapCheck.message);
      return;
    }

    setRanges(updated);
    setEditCell(null);
    setValidationError(null);
  };

  const handleKeyDown = (e, rowIndex, field) => {
    if (e.key === "Enter") {
      handleSave(rowIndex, field);
    } else if (e.key === "Escape") {
      setEditCell(null);
      setValidationError(null);
    }
  };

  const handleAddRow = () => {
    const newRanges = [...ranges];
    newRanges.push({
      _id: `temp-${Date.now()}`,
      startDayMo: "",
      endDayMo: "",
      rate: "",
      description: ""
    });
    setRanges(newRanges);
  };

  const handleDeleteRow = (rowIndex) => {
    const updated = ranges.filter((_, i) => i !== rowIndex);
    setRanges(updated);
  };

  const handleSaveAll = async () => {
    //   console.log('handleSaveAll called with ranges:', ranges);
    const filledRanges = ranges.filter(r => r.startDayMo || r.endDayMo || r.rate || r.description);
    console.log('handleSaveAll called with filled ranges:', filledRanges);
    const overlapCheck = checkOverlap(filledRanges);
    if (overlapCheck.hasOverlap) {
      setValidationError(overlapCheck.message);
      return;
    }

    for (let range of filledRanges) {
      if (!range.startDayMo || !range.endDayMo || !range.rate) {
        setValidationError("All non-empty rows must have Start Date, End Date, and Rate");
        return;
      }
    }

    setSaving(true);
    try {
      await axios.put(`/hoas/${hoaId}`, {
        payment_ranges: filledRanges
      });
      setModal({
        isOpen: true,
        type: "alert",
        title: "Success",
        message: `Payment ranges updated successfully!`,
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
          setValidationError(null);
          navigate(`/${hoaId}/admin`);
        },
      });
      // alert("Payment ranges updated successfully!");
      // setValidationError(null);
      // navigate(`/${hoaId}/admin`);
    } catch (err) {
      setError("Failed to save payment ranges");
      console.error("Error saving payment ranges:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleBackClick = () => {
    navigate(`/${hoaId}/admin`);
  };

  const navButtons = [
    {
      label: "Back to Administration",
      onClick: handleBackClick,
      which: "goback"
    }
  ];

  if (loading) {
    return (
      <div className="editable-table-container">
        <DashboardNavbar title="Payment Ranges" buttons={navButtons} />
        <div className="page-content" style={{ textAlign: "center", paddingTop: "50px" }}>
          <p>Loading payment ranges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editable-table-container">
      <DashboardNavbar title="Payment Ranges" buttons={navButtons} />

      <div className="editable-table-content">
        <h1 className="editable-table-title">Manage Payment Ranges</h1>

        {error && (
          <div className="editable-table-error">
            {error}
          </div>
        )}

        {validationError && (
          <div className="editable-table-validation-error">
            {validationError}
          </div>
        )}

        <div className="editable-table-wrapper">
          <table className="editable-table">
            <thead>
              <tr>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Rate/Night</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ranges.map((row, idx) => (
                <tr key={idx}>
                  <td onClick={() => handleCellClick(idx, "startDayMo")}>
                    {editCell?.rowIndex === idx && editCell?.field === "startDayMo" ? (
                      <input
                        type="text"
                        className="editable-table-input"
                        placeholder="MM-DD"
                        autoFocus
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => handleSave(idx, "startDayMo")}
                        onKeyDown={(e) => handleKeyDown(e, idx, "startDayMo")}
                      />
                    ) : (
                      <span className={`editable-table-cell-text ${row.startDayMo ? 'filled' : 'empty'}`}>
                        {row.startDayMo || "(click to edit)"}
                      </span>
                    )}
                  </td>
                  <td onClick={() => handleCellClick(idx, "endDayMo")}>
                    {editCell?.rowIndex === idx && editCell?.field === "endDayMo" ? (
                      <input
                        type="text"
                        className="editable-table-input"
                        placeholder="MM-DD"
                        autoFocus
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => handleSave(idx, "endDayMo")}
                        onKeyDown={(e) => handleKeyDown(e, idx, "endDayMo")}
                      />
                    ) : (
                      <span className={`editable-table-cell-text ${row.endDayMo ? 'filled' : 'empty'}`}>
                        {row.endDayMo || "(click to edit)"}
                      </span>
                    )}
                  </td>
                  <td onClick={() => handleCellClick(idx, "rate")}>
                    {editCell?.rowIndex === idx && editCell?.field === "rate" ? (
                      <input
                        type="number"
                        className="editable-table-input"
                        placeholder="0.00"
                        step="0.01"
                        autoFocus
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => handleSave(idx, "rate")}
                        onKeyDown={(e) => handleKeyDown(e, idx, "rate")}
                      />
                    ) : (
                      <span className={`editable-table-cell-text ${row.rate ? 'filled' : 'empty'}`}>
                        {row.rate ? `$${parseFloat(row.rate).toFixed(2)}` : "(click to edit)"}
                      </span>
                    )}
                  </td>
                  <td onClick={() => handleCellClick(idx, "description")}>
                    {editCell?.rowIndex === idx && editCell?.field === "description" ? (
                      <input
                        type="text"
                        className="editable-table-input"
                        placeholder="e.g., Summer Season"
                        autoFocus
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => handleSave(idx, "description")}
                        onKeyDown={(e) => handleKeyDown(e, idx, "description")}
                      />
                    ) : (
                      <span className={`editable-table-cell-text ${row.description ? 'filled' : 'empty'}`}>
                        {row.description || "(optional)"}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="editable-table-delete-button"
                      onClick={() => handleDeleteRow(idx)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="editable-table-button-container">
          <button
            className="editable-table-add-button"
            onClick={handleAddRow}
          >
            + Add Row
          </button>

          <button
            className="editable-table-save-button"
            onClick={handleSaveAll}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>

        <div className="editable-table-instructions">
          <h3>Instructions:</h3>
          <ul>
            <li>Click any cell to edit the value</li>
            <li>Date format must be MM-DD (e.g., 01-15 for January 15th)</li>
            <li>Rate must be a positive number (e.g., 20.00)</li>
            <li>Date ranges cannot overlap</li>
            <li>Press Enter to save or Escape to cancel</li>
            <li>Only filled rows will be saved when you click "Save All Changes"</li>
          </ul>
        </div>
      </div>
      <ModalAlert
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
      />
    </div>
  );
}
