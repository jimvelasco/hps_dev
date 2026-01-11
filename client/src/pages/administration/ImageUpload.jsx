import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/api";
import DashboardNavbar from "../../components/DashboardNavbar";
import { useHoa } from "../../context/HoaContext";

export default function ImageUpload() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa } = useHoa();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const handleBackClick = () => {
    navigate(`/${hoaId}/admin`);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMessage("Please select a valid image file");
        setMessageType("error");
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setMessage("File size must be less than 10MB");
        setMessageType("error");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
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
      formData.append("image", selectedFile);
      formData.append("hoaId", hoaId);

      const response = await axios.post("/images/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(`Image uploaded successfully! URL: ${response.data.imageUrl}`);
      setMessageType("success");
      setSelectedFile(null);
      setPreview(null);
      document.getElementById("fileInput").value = "";
    } catch (error) {
      setMessage(error.response?.data?.message || "Error uploading image");
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
      <DashboardNavbar title="Upload Image" buttons={navButtons} />

      <div className="page-content">
        <div className="standardtitlebar">
          <h1 style={{ fontSize: "24px" }}>Image Upload</h1>
        </div>

        <div className="grid-flex-container">
          <section className="standardsection-wide">
            <h3 style={{ color: "#1976d2", marginTop: 0 }}>
              Upload Image to AWS
            </h3>

            <form onSubmit={handleUpload}>
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
                  Select Image
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
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
                  Maximum file size: 10MB. Supported formats: JPG, PNG, GIF,
                  WebP
                </p>
              </div>

              {preview && (
                <div style={{ marginBottom: "20px", textAlign: "center" }}>
                  <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
                    Preview:
                  </p>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                    }}
                  />
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
                }}
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
