import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/api";
import { useHoa } from "../../context/HoaContext";
import DashboardNavbar from "../../components/DashboardNavbar";
import ModalAlert from "../../components/ModalAlert";
import { getAWSResource } from "../../utils/awsHelper";
import {
  DndContext,
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableRow = ({
  row,
  idx,
  editCell,
  tempValue,
  contactids,
  handleCellClick,
  handleSave,
  handleKeyDown,
  handleDeleteRow,
  setTempValue
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: row._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? "#f0f0f0" : "inherit",
    zIndex: isDragging ? 1 : "auto",
    position: "relative"
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      <td className="drag-handle" {...listeners} style={{ cursor: 'grab', textAlign: 'center' }}>
        ☰
      </td>
      <td onClick={() => handleCellClick(idx, "contact_id")}>
        {editCell?.rowIndex === idx && editCell?.field === "contact_id" ? (
          <select
            className="editable-table-input"
            autoFocus
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={() => handleSave(idx, "contact_id")}
            onKeyDown={(e) => handleKeyDown(e, idx, "contact_id")}
          >
            <option value="">Select ID...</option>
            {contactids.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
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
  );
};

export default function ContactInformation() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
   const { hoa, loading: hoaLoading, fetchHoaById } = useHoa();
  const [contacts, setContacts] = useState([]);
  const [editCell, setEditCell] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null, onCancel: null });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchContactInformation();
  }, [hoaId]);

  const fetchContactInformation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/hoas/${hoaId}`);
      const hoaData = response.data;
      let contactInfo = hoaData.contact_information || [];

      // Ensure every contact has an _id for dnd-kit
      contactInfo = contactInfo.map((c, i) => ({
        ...c,
        _id: c._id || `contact-${Date.now()}-${i}`
      }));

      if (contactInfo.length === 0) {
        const emptyRows = Array.from({ length: 4 }, (_, i) => ({
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

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setContacts((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
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
    console.log('filledContacts:', filledContacts);
    try {
      await axios.put(`/hoas/${hoaId}`, {
        contact_information: filledContacts
      });
      setModal({
        isOpen: true,
        type: "alert",
        title: "Success",
        message: `Contact information updated successfully!`,
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
          setValidationError(null);
          navigate(`/${hoaId}/admin`);
        },
      });

      //   alert("Contact information updated successfully!");
      //   setValidationError(null);
      //  navigate(`/${hoaId}/admin`);
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
      label: "Back",
      onClick: handleBackClick,
      which: "goback"
    }
  ];

  if (loading) {
    return (
      <div className="editable-table-container">
      <DashboardNavbar title="Contact Information" title2={hoa && hoa.name} buttons={navButtons} />
        <div className="page-content" style={{ textAlign: "center", paddingTop: "50px" }}>
          <p>Loading contact information...</p>
        </div>
      </div>
    );
  }

   const contactids = [
    "hoa_support",
    "pm_renter",
    "hoa_primary",
    "pm_emergency",
    "pm_afterhours",
    "hoa_shuttle",
    "technical_suport"
  ];


let backgroundImage = '';
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
  }
  //console.log('HOA:', hoa,backgroundImage);


  return (
    <div style={{ minHeight: "100vh", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <DashboardNavbar title="Contact Information" title2={hoa && hoa.name} buttons={navButtons} />
          <div className="editable-table-container" style={{width:"80%",margin:"auto"}}>

      <div className="page-content">

      <div className="editable-table-content" >
        <h1 className="editable-table-title" style={{marginBottom:"10px"}}>Manage Contact Information</h1>

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="editable-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Order</th>
                  <th>Contact ID</th>
                  <th>Phone Number</th>
                  <th>Phone Description</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <SortableContext
                  items={contacts.map(c => c._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {contacts.map((row, idx) => (
                    <SortableRow
                      key={row._id}
                      row={row}
                      idx={idx}
                      editCell={editCell}
                      tempValue={tempValue}
                      contactids={contactids}
                      handleCellClick={handleCellClick}
                      handleSave={handleSave}
                      handleKeyDown={handleKeyDown}
                      handleDeleteRow={handleDeleteRow}
                      setTempValue={setTempValue}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
        </div>

        <div className="button-grid">
          <button
            className="btn btn-primary"
            onClick={handleAddRow}
          >
            + Add Row
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSaveAll}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>

        <div className="editable-table-instructions">
          <h3>Instructions:</h3>
          <ul>
            <li>Drag and drop rows using the ☰ icon to reorder contacts</li>
            <li>Click any cell to edit the value</li>
            <li>Email must be in valid format (e.g., info@example.com)</li>
            <li>Press Enter to save or Escape to cancel</li>
            <li>Only filled rows will be saved when you click "Save All Changes"</li>
            <li>Contact ID can be used to identify the contact type (e.g., HOA, Manager, Maintenance)</li>
          </ul>
        </div>
      </div>
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
