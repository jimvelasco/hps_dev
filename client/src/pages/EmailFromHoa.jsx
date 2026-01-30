import React, { useState } from "react";
import { useParams, useNavigate,useLocation } from "react-router-dom";
import { useHoa } from "../context/HoaContext";

import axios from "../services/api";
import DashboardNavbar from "../components/DashboardNavbar";
import ModalAlert from "../components/ModalAlert";
import { getAWSResource } from "../utils/awsHelper";


export default function EmailFromHoa() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const location = useLocation();
  const email = location.state?.email;
 // console.log('EmailFromHoa email is:', email);

  const [sending, setSending] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null });
  const [formData, setFormData] = useState({
    subject: "",
    returnEmail: "",
    message: ""
  });

  const subjects = [
    "General Inquiry",
    "Complaint",
    "Maintenance Request",
    "Billing Question",
    "Rule Violation Report",
    "Other"
  ];

  const handleBackClick = () => {
    if (hoaId) {
      navigate(`/${hoaId}`);
    } else {
      navigate("/")
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Missing Field",
        message: "Please select a subject",
        onConfirm: () => setModal({ ...modal, isOpen: false })
      });
      return;
    }

    if (!formData.returnEmail || !formData.returnEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Invalid Email",
        message: "Please enter a valid email address",
        onConfirm: () => setModal({ ...modal, isOpen: false })
      });
      return;
    }

    if (!formData.message.trim()) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Missing Message",
        message: "Please enter a message",
        onConfirm: () => setModal({ ...modal, isOpen: false })
      });
      return;
    }

    setSending(true);

    try {
      await axios.post("/users/send-email-from-hoa", {
        hoaId,
        subject: formData.subject,
        returnEmail: formData.returnEmail,
        message: formData.message,
        toEmail: email
      });

      setModal({
        isOpen: true,
        type: "success",
        title: "Email Sent",
        message: "Your email has been sent successfully.",
        onConfirm: () => {
          setModal({ ...modal, isOpen: false });
          if (hoaId) {
            navigate(`/${hoaId}`);
          } else {
            navigate("/")
          }
        }
      });
      setFormData({ subject: "", returnEmail: "", message: "" });
    } catch (error) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: error.response?.data?.message || "Failed to send email",
        onConfirm: () => setModal({ ...modal, isOpen: false })
      });
    } finally {
      setSending(false);
    }
  };

  const navButtons = [
    {
      label: "Back",
      onClick: handleBackClick,
      which: "goback"
    }
  ];
  let backgroundImage = '';
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
  }
  let hoaorhps = 'HOA';

  if (email === undefined ) {
    hoaorhps = 'HPS'

  }

  return (
    <div style={{ minHeight: "100vh", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <DashboardNavbar title="Email HOA" buttons={navButtons} />

      <div className="page-content">
        <div className="standardtitlebar">
         
          <h1 style={{ fontSize: "24px" }}>Send Email to {hoaorhps}</h1>
          {email && (
            <p><strong>{email}</strong></p>
          )}
        </div>

        <div className="grid-flex-container">
          <section className="standardsection-wide">
            <h3 style={{ color: "#1976d2", marginTop: 0 ,marginBottom:"10px"}}>
              Contact {hoaorhps}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="subject" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={sending}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    opacity: sending ? 0.6 : 1,
                    cursor: sending ? "not-allowed" : "pointer"
                  }}
                >
                  <option value="">-- Select a subject --</option>
                  {subjects.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="returnEmail" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
                  Your Email Address
                </label>
                <input
                  id="returnEmail"
                  type="email"
                  name="returnEmail"
                  value={formData.returnEmail}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  disabled={sending}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    opacity: sending ? 0.6 : 1,
                    cursor: sending ? "not-allowed" : "auto"
                  }}
                />
                <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                  So the HOA can respond to you
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="message" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter your message here..."
                  disabled={sending}
                  rows="8"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    fontFamily: "Arial, sans-serif",
                    resize: "vertical",
                    opacity: sending ? 0.6 : 1,
                    cursor: sending ? "not-allowed" : "auto"
                  }}
                />
                <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                  Maximum 5000 characters
                </p>
              </div>

              <div className="button-grid" >
                <button
                  type="submit"
                  disabled={sending}
                  className="btn btn-primary"
                  style={{
                    opacity: sending ? 0.6 : 1,
                    cursor: sending ? "not-allowed" : "pointer"
                  }}
                >
                  {sending ? "Sending..." : "Send Email"}
                </button>
                <button
                  type="button"
                  onClick={handleBackClick}
                  disabled={sending}
                  className="btn btn-default"
                  style={{
                    backgroundColor: "#999",
                    opacity: sending ? 0.6 : 1,
                    cursor: sending ? "not-allowed" : "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      <ModalAlert
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
      />
    </div>
  );
}
