import React, { useState } from "react";
import axios from "../services/api";
import ModalAlert from "./ModalAlert";

export default function ViolationForm({ isOpen, hoaId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    violation_plate: "",
    violation_state: "",
    violation_location: "",
    violation_type: "",
    violation_date: "",
    violation_time: "",
    violation_reporter: "",
    violation_description: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
    onConfirm: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.violation_plate || !formData.violation_state || !formData.violation_location || 
        !formData.violation_type || !formData.violation_date || !formData.violation_time) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: "Please fill in all required fields",
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post("/violations", {
        ...formData,
        hoaid: hoaId
      });

      setModal({
        isOpen: true,
        type: "alert",
        title: "Success",
        message: "Violation created successfully",
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
          setFormData({
            violation_plate: "",
            violation_state: "",
            violation_location: "",
            violation_type: "",
            violation_date: "",
            violation_time: "",
            violation_reporter: "",
            violation_description: ""
          });
          onClose();
          if (onSuccess) {
            onSuccess();
          }
        }
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to create violation";
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: errorMessage,
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const formStyles = `
    .violation-form-container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 15px;
      background-color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
      z-index: 1000;
     
    }

    .violation-form-content {
      background-color: white;
      border-radius: 15px;
      padding: 30px;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    
    }

    .violation-form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }

    .violation-form-row.full {
      grid-template-columns: 1fr;
    }

    .violation-form-group {
      display: flex;
      flex-direction: column;
    }

    .violation-form-label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
      color: #333;
      font-size: 14px;
    }

    .violation-form-required {
      color: #d32f2f;
    }

    .violation-form-buttons {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      justify-content: flex-end;
    }
  `;

  return (
    <>
      <style>{formStyles}</style>
      <div className="violation-form-container">
        <div className="violation-form-content">
          <h2 style={{ marginTop: 0, color: "#333" }}>New Violation</h2>

          <form onSubmit={handleSubmit}>
            <div className="violation-form-row">
              <div className="violation-form-group">
                <label className="violation-form-label">
                  License Plate <span className="violation-form-required">*</span>
                </label>
                <input
                  className="standardinput"
                  type="text"
                  name="violation_plate"
                  value={formData.violation_plate}
                  onChange={handleInputChange}
                  placeholder="e.g., ABC1234"
                  required
                />
              </div>

              <div className="violation-form-group">
                <label className="violation-form-label">
                  State <span className="violation-form-required">*</span>
                </label>
                <input
                  className="standardinput"
                  type="text"
                  name="violation_state"
                  value={formData.violation_state}
                  onChange={handleInputChange}
                  placeholder="e.g., CO"
                  maxLength="2"
                  required
                />
              </div>
            </div>

            <div className="violation-form-row full">
              <div className="violation-form-group">
                <label className="violation-form-label">
                  Location <span className="violation-form-required">*</span>
                </label>
                <input
                  className="standardinput"
                  type="text"
                  name="violation_location"
                  value={formData.violation_location}
                  onChange={handleInputChange}
                  placeholder="e.g., Lot A, Space 5"
                  required
                />
              </div>
            </div>

            <div className="violation-form-row">
              <div className="violation-form-group">
                <label className="violation-form-label">
                  Type <span className="violation-form-required">*</span>
                </label>
                <select
                  className="standardselect"
                  name="violation_type"
                  value={formData.violation_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select violation type</option>
                  <option value="Improper Parking">Improper Parking</option>
                  <option value="Fire Hydrant Blocking">Fire Hydrant Blocking</option>
                  <option value="Unregistered Vehicle">Unregistered Vehicle</option>
                  <option value="No Parking Zone">No Parking Zone</option>
                  <option value="Disabled Space Violation">Disabled Space Violation</option>
                  <option value="Street Parking">Street Parking</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="violation-form-group">
                <label className="violation-form-label">
                  Reporter
                </label>
                <input
                  className="standardinput"
                  type="text"
                  name="violation_reporter"
                  value={formData.violation_reporter}
                  onChange={handleInputChange}
                  placeholder="e.g., Security Guard"
                />
              </div>
            </div>

            <div className="violation-form-row">
              <div className="violation-form-group">
                <label className="violation-form-label">
                  Date <span className="violation-form-required">*</span>
                </label>
                <input
                  className="standardinput"
                  type="date"
                  name="violation_date"
                  value={formData.violation_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="violation-form-group">
                <label className="violation-form-label">
                  Time <span className="violation-form-required">*</span>
                </label>
                <input
                  className="standardinput"
                  type="time"
                  name="violation_time"
                  value={formData.violation_time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="violation-form-row full">
              <div className="violation-form-group">
                <label className="violation-form-label">
                  Description
                </label>
                <textarea
                  className="standardinput"
                  name="violation_description"
                  value={formData.violation_description}
                  onChange={handleInputChange}
                  placeholder="Enter violation details..."
                  rows="4"
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
            </div>

            <div className="violation-form-buttons">
              <button
                type="submit"
                className="standardsubmitbutton"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                className="standardcancelbutton"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <ModalAlert
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        onConfirm={modal.onConfirm}
      />
    </>
  );
}
