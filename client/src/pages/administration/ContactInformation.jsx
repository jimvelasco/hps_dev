import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/api";
import DashboardNavbar from "../../components/DashboardNavbar";

export default function ContactInformation() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [editCell, setEditCell] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    fetchContactInformation();
  }, [hoaId]);

  const fetchContactInformation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/hoas/${hoaId}`);
      const hoaData = response.data;
      const contactInfo = hoaData.contact_information || [];
      
      if (contactInfo.length === 0) {
        const emptyRows = Array.from({ length: 10 }, (_, i) => ({
          _id: `temp-${i}`,
          contact_id: "",
          phone_number: "",
          phone_description: "",
          email: ""
        }));
        setContacts(emptyRows);
      } else {
        setContacts(contactInfo);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load contact information");
      console.error("Error fetching contact information:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (rowIndex, field) => {
    setEditCell({ rowIndex, field });
    setTempValue(contacts[rowIndex][field] || "");
    setValidationError(null);
  };

  const handleSave = (rowIndex, field) => {
    const updated = [...contacts];
    updated[rowIndex][field] = tempValue;
    
    if (field === "email" && tempValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(tempValue)) {
        setValidationError("Invalid email format");
        return;
      }
    }

    setContacts(updated);
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
    const newContacts = [...contacts];
    newContacts.push({
      _id: `temp-${Date.now()}`,
      contact_id: "",
      phone_number: "",
      phone_description: "",
      email: ""
    });
    setContacts(newContacts);
  };

  const handleDeleteRow = (rowIndex) => {
    const updated = contacts.filter((_, i) => i !== rowIndex);
    setContacts(updated);
  };

  const handleSaveAll = async () => {
    const filledContacts = contacts.filter(
      c => c.contact_id || c.phone_number || c.phone_description || c.email
    );

    setSaving(true);
    try {
      await axios.put(`/hoas/${hoaId}`, {
        contact_information: filledContacts
      });
      alert("Contact information updated successfully!");
      setValidationError(null);
      navigate(`/${hoaId}/admin`);
    } catch (err) {
      setError("Failed to save contact information");
      console.error("Error saving contact information:", err);
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
        <DashboardNavbar title="Contact Information" buttons={navButtons} />
        <div className="page-content" style={{ textAlign: "center", paddingTop: "50px" }}>
          <p>Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editable-table-container">
      <DashboardNavbar title="Contact Information" buttons={navButtons} />

      <div className="editable-table-content">
        <h1 className="editable-table-title">Manage Contact Information</h1>
        
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
                <th>Contact ID</th>
                <th>Phone Number</th>
                <th>Phone Description</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((row, idx) => (
                <tr key={idx}>
                  <td onClick={() => handleCellClick(idx, "contact_id")}>
                    {editCell?.rowIndex === idx && editCell?.field === "contact_id" ? (
                      <input
                        type="text"
                        className="editable-table-input"
                        placeholder="e.g., HOA, Manager, Maintenance"
                        autoFocus
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => handleSave(idx, "contact_id")}
                        onKeyDown={(e) => handleKeyDown(e, idx, "contact_id")}
                      />
                    ) : (
                      <span className={`editable-table-cell-text ${row.contact_id ? 'filled' : 'empty'}`}>
                        {row.contact_id || "(click to edit)"}
                      </span>
                    )}
                  </td>
                  <td onClick={() => handleCellClick(idx, "phone_number")}>
                    {editCell?.rowIndex === idx && editCell?.field === "phone_number" ? (
                      <input
                        type="text"
                        className="editable-table-input"
                        placeholder="e.g., (555) 123-4567"
                        autoFocus
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => handleSave(idx, "phone_number")}
                        onKeyDown={(e) => handleKeyDown(e, idx, "phone_number")}
                      />
                    ) : (
                      <span className={`editable-table-cell-text ${row.phone_number ? 'filled' : 'empty'}`}>
                        {row.phone_number || "(click to edit)"}
                      </span>
                    )}
                  </td>
                  <td onClick={() => handleCellClick(idx, "phone_description")}>
                    {editCell?.rowIndex === idx && editCell?.field === "phone_description" ? (
                      <input
                        type="text"
                        className="editable-table-input"
                        placeholder="e.g., Office, Emergency"
                        autoFocus
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => handleSave(idx, "phone_description")}
                        onKeyDown={(e) => handleKeyDown(e, idx, "phone_description")}
                      />
                    ) : (
                      <span className={`editable-table-cell-text ${row.phone_description ? 'filled' : 'empty'}`}>
                        {row.phone_description || "(optional)"}
                      </span>
                    )}
                  </td>
                  <td onClick={() => handleCellClick(idx, "email")}>
                    {editCell?.rowIndex === idx && editCell?.field === "email" ? (
                      <input
                        type="email"
                        className="editable-table-input"
                        placeholder="e.g., info@hoa.com"
                        autoFocus
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => handleSave(idx, "email")}
                        onKeyDown={(e) => handleKeyDown(e, idx, "email")}
                      />
                    ) : (
                      <span className={`editable-table-cell-text ${row.email ? 'filled' : 'empty'}`}>
                        {row.email || "(click to edit)"}
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
            <li>Email must be in valid format (e.g., info@example.com)</li>
            <li>Press Enter to save or Escape to cancel</li>
            <li>Only filled rows will be saved when you click "Save All Changes"</li>
            <li>Contact ID can be used to identify the contact type (e.g., HOA, Manager, Maintenance)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
