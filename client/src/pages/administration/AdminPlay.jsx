import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/api";
import DashboardNavbar from "../../components/DashboardNavbar";

export default function Administration() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateDateLoading, setUpdateDateLoading] = useState(false);
  const [jjvrunqueryLoading, setJjvrunqueryLoading] = useState(false);

  const handleBackClick = () => {
    navigate(`/${hoaId}/dashboard`);
  };

  const handleManageDatabaseClick = () => {
    // Placeholder for future database management functionality
    console.log("Manage Database clicked");
    navigate(-1)
  };

  const handleDeleteStatusFlag9 = async () => {
    if (!window.confirm("Are you sure you want to delete all vehicles with status_flag 9? This action cannot be undone.")) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await axios.delete("/vehicles/status/8");
      
      if (response.status === 200) {
        alert(`Successfully deleted ${response.data.deletedCount} vehicle(s)`);
      }
    } catch (err) {
      alert(`Error deleting vehicles: ${err.response?.data?.message || err.message}`);
      console.error("Error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateDateFields = async () => {
    if (!window.confirm("Are you sure you want to update all vehicle date fields? This will convert startdate to checkin and enddate to checkout.")) {
      return;
    }

    setUpdateDateLoading(true);
    try {
      const response = await axios.put("/vehicles/batch/update-dates");
      
      if (response.status === 200) {
        alert(`Successfully updated ${response.data.updatedCount} vehicle(s)`);
      }
    } catch (err) {
      alert(`Error updating vehicles: ${err.response?.data?.message || err.message}`);
      console.error("Error:", err);
    } finally {
      setUpdateDateLoading(false);
    }
  };

  const handleJjvrunquery = async () => {
    setJjvrunqueryLoading(true);
    try {
      const response = await axios.post(`/vehicles/jjvrunquery/${hoaId}`);
      
      if (response.status === 200) {
        alert(`jjvrunquery executed successfully. Result: ${response.data.message || "Done"}`);
      }
    } catch (err) {
      alert(`Error running jjvrunquery: ${err.response?.data?.message || err.message}`);
      console.error("Error:", err);
    } finally {
      setJjvrunqueryLoading(false);
    }
  };

   const handleTestModel = async () => {
    console.log("handleTestModel called");
    try {
      const response = await axios.post(`/tests/`);
      if (response.status === 201) {
        alert(`test model executed successfully. Result: ${response.data.message || "Done"}`);
        const responseData = await axios.get(`/tests/`);
        console.log("Test Models fetched:", responseData.data);
      }
    } catch (err) {
      alert(`Error running handleTestModel: ${err.response?.data?.message || err.message}`);
      console.error("Error:", err);
    } 
  };
   const handleTestModelGet = async () => {
    console.log("handleTestModel called");
    
     const startd = "2025-12-27";
    try {
      const response = await axios.get(`/tests/${startd}`);
      if (response.status === 200) {
       
        console.log("Test Models fetched:", response.data);
      }
    } catch (err) {
      alert(`Error running handleTestModel: ${err.response?.data?.message || err.message}`);
      console.error("Error:", err);
    } 
  };

  const handleOpenTestPage = () => {
    navigate(`/${hoaId}/test`);
  };

  const handleManagePaymentRanges = () => {
    navigate(`/${hoaId}/payment-ranges`);
  };

  const handleManageHoaSettings = () => {
    navigate(`/${hoaId}/hoa-settings`);
  };

  const handleManageContactInformation = () => {
    navigate(`/${hoaId}/contact-information`);
  };

  const navButtons = [
    {
      label: "Back to Dashboard",
      onClick: handleBackClick,
      which: "goback"
    }
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <DashboardNavbar title="Administration" buttons={navButtons} />

      <div className="page-content">
        <h1 style={{ color: "#333" }}>Administration Panel</h1>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "30px"
        }}>
          <section style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#1976d2", marginTop: 0 }}>Database Management Page</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Manage and maintain your HOA database
            </p>
            <button
              onClick={handleManageDatabaseClick}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#388e3c"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#4caf50"}
            >
              Manage Database
            </button>
          </section>
          
          <section style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#d32f2f", marginTop: 0 }}>Delete Archived Vehicles</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Delete all vehicles with status_flag 9 (archived)
            </p>
            <button
              onClick={handleDeleteStatusFlag9}
              disabled={deleteLoading}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: deleteLoading ? "#ccc" : "#d32f2f",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: deleteLoading ? "not-allowed" : "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease"
              }}
              onMouseEnter={(e) => !deleteLoading && (e.target.style.backgroundColor = "#b71c1c")}
              onMouseLeave={(e) => !deleteLoading && (e.target.style.backgroundColor = "#d32f2f")}
            >
              {deleteLoading ? "Deleting..." : "Delete Status Flag 9"}
            </button>
          </section>

          <section style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#ff9800", marginTop: 0 }}>Update Date Fields</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Convert startdate to checkin and enddate to checkout for all vehicles
            </p>
            <button
              onClick={handleUpdateDateFields}
              disabled={updateDateLoading}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: updateDateLoading ? "#ccc" : "#ff9800",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: updateDateLoading ? "not-allowed" : "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease"
              }}
              onMouseEnter={(e) => !updateDateLoading && (e.target.style.backgroundColor = "#e68900")}
              onMouseLeave={(e) => !updateDateLoading && (e.target.style.backgroundColor = "#ff9800")}
            >
              {updateDateLoading ? "Updating..." : "Update Date Fields"}
            </button>
          </section>

          <section style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#9c27b0", marginTop: 0 }}>jjvrunquery</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Execute jjvrunquery operation
            </p>
            <button
              id="jjvrunquery"
              onClick={handleJjvrunquery}
              disabled={jjvrunqueryLoading}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: jjvrunqueryLoading ? "#ccc" : "#9c27b0",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: jjvrunqueryLoading ? "not-allowed" : "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease"
              }}
              onMouseEnter={(e) => !jjvrunqueryLoading && (e.target.style.backgroundColor = "#7b1fa2")}
              onMouseLeave={(e) => !jjvrunqueryLoading && (e.target.style.backgroundColor = "#9c27b0")}
            >
              {jjvrunqueryLoading ? "Running..." : "jjvrunquery"}
            </button>
          </section>

          <section style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#1976d2", marginTop: 0 }}>Test Page</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Open the test page
            </p>
            <button
              onClick={handleOpenTestPage}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#1565c0"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#1976d2"}
            >
              Open Test Page
            </button>
          </section>

          <section style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#00897b", marginTop: 0 }}>Payment Ranges</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Manage parking rate schedules by date ranges
            </p>
            <button
              onClick={handleManagePaymentRanges}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "#00897b",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#006064"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#00897b"}
            >
              Manage Payment Ranges
            </button>
          </section>

          <section style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#2196f3", marginTop: 0 }}>HOA Settings</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Configure HOA property information and parking policies
            </p>
            <button
              onClick={handleManageHoaSettings}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "#2196f3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#1976d2"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#2196f3"}
            >
              Manage HOA Settings
            </button>
          </section>

          <section style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#e91e63", marginTop: 0 }}>Contact Information</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Manage HOA contact details and phone numbers
            </p>
            <button
              onClick={handleManageContactInformation}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "#e91e63",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#c2185b"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#e91e63"}
            >
              Manage Contact Information
            </button>
          </section>

           <section style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#e91e63", marginTop: 0 }}>Contact Information</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Test Model
            </p>
            <button
              onClick={handleTestModel}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "#e91e63",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#c2185b"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#e91e63"}
            >
             Test Model
            </button>
          </section>

            <section style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#e91e63", marginTop: 0 }}>Contact Information</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Test Model
            </p>
            <button
              onClick={handleTestModelGet}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "#e91e63",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#c2185b"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#e91e63"}
            >
             Test Model Get
            </button>
          </section>






        </div>
      </div>
    </div>
  );
}
