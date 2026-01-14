import React, { useState } from "react";
import axios from "../services/api";
import ModalAlert from "./ModalAlert";

export default function ForgotPasswordDialog({ isOpen, hoaId, onClose }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: "Please enter your email address",
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post("/users/forgot-password", {
        email,
        hoaId
      });

      setModal({
        isOpen: true,
        type: "alert",
        title: "Success",
        message: "Password reset email sent successfully. Please check your email for instructions.",
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
          setEmail("");
          onClose();
        }
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to send reset email";
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

  return (
    <>
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
          padding: "30px",
          maxWidth: "360px",
          boxSizing: "border-box",
          width: "90%",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}>
          <h2 style={{ marginTop: 0, color: "#333" }}>Forgot Password</h2>

          <p style={{ color: "#666", marginBottom: "20px" }}>
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label htmlFor="forgotEmail" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Email Address
              </label>
              <input
                id="forgotEmail"
                className="standardinput"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="button-grid"> 
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send"}
              </button>
              <button
                type="button"
                className="btn btn-default"
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
