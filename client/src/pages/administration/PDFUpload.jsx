import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/api";
import DashboardNavbar from "../../components/DashboardNavbar";
import { useHoa } from "../../context/HoaContext";
import { getAWSResource } from "../../utils/awsHelper";

export default function PDFUpload() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa } = useHoa();
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePrefix, setFilePrefix] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const handleBackClick = () => {
    navigate(`/${hoaId}/admin`);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setMessage("Please select a valid PDF file");
        setMessageType("error");
        return;
      }

      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        setMessage("File size must be less than 50MB");
        setMessageType("error");
        return;
      }

      setSelectedFile(file);
      setMessage(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setMessage("Please select a file first");
      setMessageType("error");
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("pdf", selectedFile);
      formData.append("hoaId", hoaId);
      if (filePrefix.trim()) {
        formData.append("filePrefix", filePrefix.trim());
      }

      const response = await axios.post("/images/upload-pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(`PDF uploaded successfully! URL: ${response.data.pdfUrl}`);
      setMessageType("success");
      setSelectedFile(null);
      document.getElementById("fileInput").value = "";
    } catch (error) {
      setMessage(error.response?.data?.message || "Error uploading PDF");
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  };

  const navButtons = [
    {
      label: "Back to Administration",
      onClick: handleBackClick,
      which: "goback",
    },
  ];

  let backgroundImage = "";
  if (hoa) {
    backgroundImage = hoa.background_image_url;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <DashboardNavbar title="Upload PDF" buttons={navButtons} />

      <div className="page-content">
        <div className="standardtitlebar">
          <h1 style={{ fontSize: "24px" }}>PDF Upload</h1>
        </div>

        <div className="grid-flex-container">
          <section className="standardsection-wide">
            <h3 style={{ color: "#1976d2", marginTop: 0 }}>
              Upload PDF to AWS
            </h3>

            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="prefixInput"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  File Prefix (Optional)
                </label>
                <input
                  id="prefixInput"
                  type="text"
                  value={filePrefix}
                  onChange={(e) => setFilePrefix(e.target.value)}
                  placeholder="e.g., Document, Report, Invoice..."
                  disabled={uploading}
                  style={{
                    display: "block",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    width: "100%",
                    boxSizing: "border-box",
                    fontSize: "14px",
                    opacity: uploading ? 0.6 : 1,
                    cursor: uploading ? "not-allowed" : "auto",
                  }}
                />
                <p style={{ fontSize: "12px", color: "#666", marginTop: "6px", marginBottom: "16px" }}>
                  If provided, this will be prepended to the filename with a dash (e.g., "Report-filename.pdf")
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="fileInput"
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Select PDF File
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  style={{
                    display: "block",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    width: "100%",
                    boxSizing: "border-box",
                    cursor: uploading ? "not-allowed" : "pointer",
                    opacity: uploading ? 0.6 : 1,
                  }}
                />
                <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                  Maximum file size: 50MB
                </p>
              </div>

              {selectedFile && (
                <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
                  <p style={{ fontSize: "14px", color: "#333", marginTop: 0 }}>
                    <strong>Selected file:</strong> {selectedFile.name}
                  </p>
                  <p style={{ fontSize: "12px", color: "#666", marginBottom: 0 }}>
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              {message && (
                <div
                  style={{
                    padding: "12px",
                    marginBottom: "20px",
                    borderRadius: "4px",
                    backgroundColor:
                      messageType === "success" ? "#d4edda" : "#f8d7da",
                    color: messageType === "success" ? "#155724" : "#721c24",
                    border: `1px solid ${
                      messageType === "success" ? "#c3e6cb" : "#f5c6cb"
                    }`,
                    fontSize: "14px",
                  }}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="standardsubmitbutton"
                style={{
                  opacity: uploading || !selectedFile ? 0.6 : 1,
                  cursor: uploading || !selectedFile ? "not-allowed" : "pointer",
                  width: "180px"
                }}
              >
                {uploading ? "Uploading..." : "Upload PDF"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
