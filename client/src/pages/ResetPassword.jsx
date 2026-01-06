import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../services/api";
import ModalAlert from "../components/ModalAlert";
import { useHoa } from "../context/HoaContext";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { hoa, loading: hoaLoading, error: hoaError, fetchHoaById } = useHoa();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null });

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: "Invalid reset link. Please request a new password reset.",
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
          navigate("/");
        }
      });
    } else {
      setToken(tokenParam);
      setLoading(false);
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: "Please enter and confirm your password",
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: "Passwords do not match",
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    if (newPassword.length < 6) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: "Password must be at least 6 characters long",
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post("/users/reset-password", {
        token,
        newPassword
      });

      setModal({
        isOpen: true,
        type: "alert",
        title: "Success",
        message: "Password reset successfully! You can now log in with your new password.",
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
          navigate("/");
        }
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to reset password";
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

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#666" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    // <div style={{
    //   minHeight: "100vh",
    //   backgroundColor: "#f5f5f5",
    //   padding: "20px"
    // }}>
      <div style={{
      backgroundImage: "url('http://hoaparking.s3.amazonaws.com/steamboat-ski-resort.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      minHeight: "100vh",
      padding: "20px",
      backgroundColor: "#f5f5f5"
    }}>
      <div className="standardtitlebar">
        <h1 style={{ fontSize: "24px" }}>HOA Parking Solutions</h1>
      </div>

      <div className="loginboxes">
        <h2>Reset Your Password</h2>

        <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="newPassword" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              New Password
            </label>
            <input
              className="standardinput"
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              disabled={isSubmitting}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="confirmPassword" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Confirm Password
            </label>
            <input
              className="standardinput"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              disabled={isSubmitting}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              className="standardsubmitbutton"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
            <button
              className="standardcancelbutton"
              type="button"
              onClick={() => navigate("/")}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <ModalAlert
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        onConfirm={modal.onConfirm}
      />
    </div>
  );
}
