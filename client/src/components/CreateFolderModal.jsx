import React, { useState } from "react";

export default function CreateFolderModal({ isOpen, onClose, onCreateFolder, isLoading = false }) {
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!folderName.trim()) {
      setError("Folder name is required");
      return;
    }

    try {
      await onCreateFolder(folderName);
      setFolderName("");
    } catch (err) {
      setError(err.message || "Error creating folder");
    }
  };

  const handleClose = () => {
    setFolderName("");
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
          color: "#1976d2",
          fontSize: "20px"
        }}>
          Create Folder
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="folderNameInput"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#333"
              }}
            >
              Folder Name
            </label>
            <input
              id="folderNameInput"
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              disabled={isLoading}
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
            <p style={{ fontSize: "12px", color: "#666", marginTop: "6px", marginBottom: 0 }}>
              Note: Folder name will be converted to uppercase
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

          <div className="button-grid"
          > <button
              type="submit"
              disabled={isLoading || !folderName.trim()}
              className="btn btn-primary"
              style={{
                opacity: isLoading || !folderName.trim() ? 0.6 : 1,
                cursor: isLoading || !folderName.trim() ? "not-allowed" : "pointer"
              }}
            >
              {isLoading ? "Creating..." : "Create Folder"}
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
