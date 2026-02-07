import React, { useState } from "react";

export default function DeleteRenterVehiclesModal({ isOpen, onClose, onDelete, isLoading = false }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedDate) {
      setError("Please select a date");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete all renter vehicles with an end date before ${selectedDate}? This action cannot be undone.`)) {
      return;
    }

    try {
      await onDelete(selectedDate);
    } catch (err) {
      setError(err.message || "Error deleting vehicles");
    }
  };

  const handleClose = () => {
    setSelectedDate(new Date().toLocaleDateString("en-CA"));
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        padding: "30px",
        maxWidth: "400px",
        minWidth: "300px",
        position: "relative"
      }}>
        <h2 style={{
          margin: "0 0 20px 0",
          color: "#d32f2f",
          fontSize: "20px"
        }}>
          Delete Renter Vehicles
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="dateInput"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#333"
              }}
            >
              Vehicles ending before:
            </label>
            <input
              id="dateInput"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={isLoading}
              className="standardinput"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box",
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? "not-allowed" : "auto"
              }}
            />
            <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
              This will remove all vehicles marked as 'renter' where the end date is earlier than the date selected above.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: "10px",
                marginBottom: "15px",
                borderRadius: "4px",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                border: "1px solid #f5c6cb",
                fontSize: "14px"
              }}
            >
              {error}
            </div>
          )}

          <div className="button-grid">
            <button
              type="submit"
              disabled={isLoading || !selectedDate}
              className="btn btn-primary"
              style={{
                backgroundColor: "#d32f2f",
                borderColor: "#d32f2f",
                opacity: isLoading || !selectedDate ? 0.6 : 1,
                cursor: isLoading || !selectedDate ? "not-allowed" : "pointer"
              }}
            >
              {isLoading ? "Deleting..." : "Delete Records"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="btn btn-default"
              style={{
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? "not-allowed" : "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
