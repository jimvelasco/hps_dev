import React, { useState, useEffect } from "react";
import axios from "../services/api";
import { useError } from "../context/ErrorContext";
import { useLoggedInUser } from "../hooks/useLoggedInUser";
import ViolationForm from "./ViolationForm";
import ModalAlert from "./ModalAlert";

export default function ViolationsAccordion({ hoaId }) {
  const [expandedIndices, setExpandedIndices] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showViolationForm, setShowViolationForm] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null, onCancel: null });
  const { setAppError } = useError();
  const { user: loggedInUser, loading: userLoading, clearLoggedInUser } = useLoggedInUser();

  useEffect(() => {
    if (hoaId) {
      fetchViolations();
    }
  }, [hoaId]);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/violations/${hoaId}`);
      const formattedViolations = response.data.map(violation => ({
        id : violation._id,
        title: `${violation.violation_plate} ${violation.violation_state}`,
        details: [
        //   { label: "License Plate:", value: violation.violation_plate },
        //   { label: "State:", value: violation.violation_state },
          { label: "Location:", value: violation.violation_location },
          { label: "Type:", value: violation.violation_type },
          { label: "Date:", value: violation.violation_date },
          { label: "Time:", value: violation.violation_time },
          ...(violation.violation_reporter ? [{ label: "Reporter:", value: violation.violation_reporter }] : []),
          ...(violation.violation_description ? [{ label: "Description:", value: violation.violation_description }] : []),
        ],
      }));
      setViolations(formattedViolations);
    } catch (err) {
      console.error("Error fetching violations:", err);
      setAppError(err.message || "Failed to load violations");
    } finally {
      setLoading(false);
    }
  };

  const deleteViolation = (item) => {
    setModal({
      isOpen: true,
      type: "delete",
      title: "Confirm Delete",
      message: `Are you sure you want to delete the violation for ${item.title}?`,
      confirmText: "Delete",
      onConfirm: () => confirmDelete(item.id),
      onCancel: () => setModal({ ...modal, isOpen: false })
    });
  };

  const confirmDelete = async (violationId) => {
    try {
      setModal({ ...modal, isOpen: false });
      await axios.delete(`/violations/${violationId}`);
      fetchViolations();
    } catch (err) {
      console.error("Error deleting violation:", err);
      setAppError(err.message || "Failed to delete violation");
    }
  };

  const handleShowNewViolation = () => {
    setShowViolationForm(true);
  };

  const handleCloseViolationForm = () => {
    setShowViolationForm(false);
  };

  const handleViolationSuccess = () => {
    fetchViolations();
  };

  const toggleItem = (index) => {
    setExpandedIndices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const accordionStyles = `
    .accordion-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
   
      width: 100%;
      font-size: 14px;
    }

    .accordion-item {
      border: 0px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      background: white;
    }

    .accordion-header {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0px;
      background-color: #1976d2;
      color: white;
      cursor: pointer;
      user-select: none;
      font-weight: 500;
      transition: background-color 0.2s;
      min-height: 40px;
    }
    .header-title {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;
      font-weight: 700;
      padding: 4px 0;
}
    .accordion-header:hover {
      background-color: #1565c0;
    }

    .accordion-toggle {
      font-size: 14px;
      transition: transform 0.2s;
    }

    .accordion-toggle.open {
      transform: rotate(180deg);
    }

    .accordion-content {
      padding: 0px;
      border-top: 0px solid #e0e0e0;
      background-color: #fafafa;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-out;
    }

    .accordion-content.open {
      max-height: 500px;
    }

    .accordion-detail {
     
      padding: 0px 0;
      border-bottom: 1px solid #ccc;
    }

     .xaccordion-detail {
      display: flex;
      justify-content:flex-start;
      padding: 5px 0;
      border-bottom: 0px solid #e0e0e0;
    }

    .accordion-detail:last-child {
      border-bottom: none;
    }

    .accordion-label {
      font-weight: bold;
      color: #555;
    
    }

    .accordion-value {
      color: #333;
    
    }
  `;

  if (loading) {
    return <p>Loading violations...</p>;
  }

  if (violations.length === 0) {
    return <p>No violations found.</p>;
  }

  return (
    <>
      <style>{accordionStyles}</style>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <button className="navbutton" onClick={handleShowNewViolation}>New Violation</button>
      </div>
      <div className="accordion-container">
        {violations.map((item, index) => (
          <div key={index} className="accordion-item">
            <div className="accordion-header" onClick={() => toggleItem(index)} >
              <div>{item.title}</div>
            </div>
            <div className={`accordion-content ${expandedIndices.includes(index) ? "open" : ""}`}>
              {item.details.map((detail, detailIndex) => (
                <div key={detailIndex} className="accordion-detail">
                  <div className="accordion-label">{detail.label}</div>
                  <div className="accordion-value">{detail.value}</div>
                </div>
              ))}
              {loggedInUser && loggedInUser.role === 'admin' &&
                <div style={{ textAlign: 'center', margin: '5px' }}>
                  <button className="btnxs btn-danger" style={{marginTop:"5px"}} onClick={() => deleteViolation(item)}>Delete</button>
                </div>
              }
            </div>
          </div>
        ))}
      </div>
      <ViolationForm
        isOpen={showViolationForm}
        hoaId={hoaId}
        onClose={handleCloseViolationForm}
        onSuccess={handleViolationSuccess}
      />
      <ModalAlert
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
      />
    </>
  );
}
