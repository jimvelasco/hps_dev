import React from "react";

export default function ModalAlert({ isOpen, title, message, type = "alert", onConfirm, onCancel, confirmText = "OK", cancelText = "Cancel" }) {
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
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.8)",
        padding: "30px",
        maxWidth: "360px",
        minWidth: "300px",
        textAlign: "center",
        position: "relative"
      }}>
        {title && (
          <h2 style={{
            margin: "0 0 15px 0",
            color: type === "delete" ? "#d32f2f" : "#1976d2",
            fontSize: "20px"
          }}>
            {title}
          </h2>
        )}

        <p style={{
          margin: "15px 0 30px 0",
          color: "#333",
          fontSize: "16px",
          lineHeight: "1.5"
        }}>
          {message}
        </p>

        <div style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
           <button
            className={type === "delete" ? "standarddeletebutton" : "standardsubmitbutton"}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          {type === "confirm" && (
            <button
              className="standardcancelbutton"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}

         
        </div>
      </div>
    </div>
  );
}
