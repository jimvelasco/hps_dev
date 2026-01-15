import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/api";
import DashboardNavbar from "../../components/DashboardNavbar";
import CreateFolderModal from "../../components/CreateFolderModal";
import { useHoa } from "../../context/HoaContext";
import { getAWSResource } from "../../utils/awsHelper";

export default function Administration() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateDateLoading, setUpdateDateLoading] = useState(false);
  const [jjvrunqueryLoading, setJjvrunqueryLoading] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [createFolderLoading, setCreateFolderLoading] = useState(false);
  const [createFolderMessage, setCreateFolderMessage] = useState(null);

  const handleBackClick = () => {
    navigate(`/${hoaId}/dashboard`);
  };

  // const handleManageDatabaseClick = () => {
  //   // Placeholder for future database management functionality
  //   console.log("Manage Database clicked");
  //   navigate(-1)
  // };

  // const handleDeleteStatusFlag9 = async () => {
  //   if (!window.confirm("Are you sure you want to delete all vehicles with status_flag 9? This action cannot be undone.")) {
  //     return;
  //   }

  //   setDeleteLoading(true);
  //   try {
  //     const response = await axios.delete("/vehicles/status/8");
      
  //     if (response.status === 200) {
  //       alert(`Successfully deleted ${response.data.deletedCount} vehicle(s)`);
  //     }
  //   } catch (err) {
  //     alert(`Error deleting vehicles: ${err.response?.data?.message || err.message}`);
  //     console.error("Error:", err);
  //   } finally {
  //     setDeleteLoading(false);
  //   }
  // };

  // const handleUpdateDateFields = async () => {
  //   if (!window.confirm("Are you sure you want to update all vehicle date fields? This will convert startdate to checkin and enddate to checkout.")) {
  //     return;
  //   }

  //   setUpdateDateLoading(true);
  //   try {
  //     const response = await axios.put("/vehicles/batch/update-dates");
      
  //     if (response.status === 200) {
  //       alert(`Successfully updated ${response.data.updatedCount} vehicle(s)`);
  //     }
  //   } catch (err) {
  //     alert(`Error updating vehicles: ${err.response?.data?.message || err.message}`);
  //     console.error("Error:", err);
  //   } finally {
  //     setUpdateDateLoading(false);
  //   }
  // };

  // const handleJjvrunquery = async () => {
  //   setJjvrunqueryLoading(true);
  //   try {
  //     const response = await axios.post(`/vehicles/jjvrunquery/${hoaId}`);
      
  //     if (response.status === 200) {
  //       alert(`jjvrunquery executed successfully. Result: ${response.data.message || "Done"}`);
  //     }
  //   } catch (err) {
  //     alert(`Error running jjvrunquery: ${err.response?.data?.message || err.message}`);
  //     console.error("Error:", err);
  //   } finally {
  //     setJjvrunqueryLoading(false);
  //   }
  // };

  //  const handleTestModel = async () => {
  //   console.log("handleTestModel called");
  //   try {
  //     const response = await axios.post(`/tests/`);
  //     if (response.status === 201) {
  //       alert(`test model executed successfully. Result: ${response.data.message || "Done"}`);
  //       const responseData = await axios.get(`/tests/`);
  //       console.log("Test Models fetched:", responseData.data);
  //     }
  //   } catch (err) {
  //     alert(`Error running handleTestModel: ${err.response?.data?.message || err.message}`);
  //     console.error("Error:", err);
  //   } 
  // };
  //  const handleTestModelGet = async () => {
  //   console.log("handleTestModel called");
    
  //    const startd = "2025-12-27";
  //   try {
  //     const response = await axios.get(`/tests/${startd}`);
  //     if (response.status === 200) {
       
  //       console.log("Test Models fetched:", response.data);
  //     }
  //   } catch (err) {
  //     alert(`Error running handleTestModel: ${err.response?.data?.message || err.message}`);
  //     console.error("Error:", err);
  //   } 
  // };

  // const handleOpenTestPage = () => {
  //   navigate(`/${hoaId}/test`);
  // };

  const handleManagePaymentRanges = () => {
    navigate(`/${hoaId}/payment-ranges`);
  };

  const handleManageHoaSettings = () => {
    navigate(`/${hoaId}/hoa-settings`);
  };

  const handleManageContactInformation = () => {
    navigate(`/${hoaId}/contact-information`);
  };

  const handleImageUpload = () => {
    navigate(`/${hoaId}/image-upload`);
  };

  const handlePdfUpload = () => {
    navigate(`/${hoaId}/pdf-upload`);
  };

   const handleShowProfile = () => {
    navigate(`/${hoaId}/profile`);
  };

  const handlePaymentRefund = () => {
    navigate(`/${hoaId}/payment-refund`);
  };

  const handleCreateFolder = async (folderName) => {
    setCreateFolderLoading(true);
    setCreateFolderMessage(null);
    try {
      const response = await axios.post("/images/create-folder", { folderName });
      setCreateFolderMessage({
        type: "success",
        text: `Folder "${response.data.folderName}" created successfully in S3 bucket!`
      });
      setShowCreateFolderModal(false);
      setTimeout(() => {
        setCreateFolderMessage(null);
      }, 5000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Error creating folder";
      setCreateFolderMessage({
        type: "error",
        text: errorMsg
      });
    } finally {
      setCreateFolderLoading(false);
    }
  };

  const navButtons = [
    {
      label: "Back to Dashboard",
      onClick: handleBackClick,
      which: "goback"
    }
  ];

let backgroundImage = '';
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
  }

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#f5f5f5",
      backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover",
      backgroundPosition: "center", backgroundAttachment: "fixed"
    }}>
      <DashboardNavbar title="Administration" buttons={navButtons} />

      <div className="page-content">
        <div className="standardtitlebar">
          <h1 style={{ fontSize: "24px" }}>Administration Panel</h1>
          <div style={{ marginTop: '5px' }}>
          </div>
        </div>

          <div className="grid-flex-container">
         
           <section className="standardsection">
            <h3 style={{ color: "#e91e63", marginTop: 0 }}>HOA Profile</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Manage HOA Profile including password reset
            </p>
            <button className="standardsubmitbutton"
              onClick={handleShowProfile}
              style={{width:"200px"}}>
             HOA Profile
            </button>
          </section>

           <section className="standardsection">
            <h3 style={{ color: "#e91e63", marginTop: 0 }}>HOA Settings</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Configure HOA property and parking policies
            </p>
            <button  className="standardsubmitbutton"
              onClick={handleManageHoaSettings}
               style={{width:"200px"}}>
              HOA Settings
            </button>
          </section>

         

           <section className="standardsection">
            <h3 style={{ color: "#e91e63", marginTop: 0 }}>Create S3 Folder</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Create a new folder in the HOA parking S3 bucket
            </p>
            <button className="standardsubmitbutton"
              onClick={() => setShowCreateFolderModal(true)}
              style={{width:"200px"}}>
             Create Folder
            </button>
          </section>

           <section className="standardsection">
            <h3 style={{ color: "#e91e63", marginTop: 0 }}>Image Upload</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Upload images to AWS S3 bucket
            </p>
            <button className="standardsubmitbutton"
              onClick={handleImageUpload}
              style={{width:"200px"}}>
             Upload Image
            </button>
          </section>

          <section className="standardsection">
            <h3 style={{ color: "#e91e63", marginTop: 0 }}>PDF Upload</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Upload PDF files to AWS S3 bucket
            </p>
            <button className="standardsubmitbutton"
              onClick={handlePdfUpload}
              style={{width:"200px"}}>
             Upload PDF
            </button>
          </section>




           <section className="standardsection">
            <h3 style={{ color: "#e91e63", marginTop: 0 }}>Contact Information</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Manage HOA contact details and phone numbers
            </p>
            <button  className="standardsubmitbutton"
              onClick={handleManageContactInformation}
               style={{width:"200px"}} >
              Contact Information
            </button>
          </section>

          <section className="standardsection">
            <h3 style={{ color: "#e91e63", marginTop: 0 }}>Payment Ranges</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Manage parking rate schedules by date ranges
            </p>
            <button className="standardsubmitbutton"
              onClick={handleManagePaymentRanges}
              style={{width:"200px"}}>
              Payment Ranges
            </button>
          </section>

          <section className="standardsection">
            <h3 style={{ color: "#e91e63", marginTop: 0 }}>Payment Refunds</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Process refunds for completed parking payments
            </p>
            <button className="standardsubmitbutton"
              onClick={handlePaymentRefund}
              style={{width:"200px"}}>
              Process Refund
            </button>
          </section>

        </div>

        {createFolderMessage && (
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              padding: "15px 20px",
              borderRadius: "4px",
              backgroundColor: createFolderMessage.type === "success" ? "#d4edda" : "#f8d7da",
              color: createFolderMessage.type === "success" ? "#155724" : "#721c24",
              border: `1px solid ${createFolderMessage.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
              fontSize: "14px",
              maxWidth: "400px",
              zIndex: 999
            }}
          >
            {createFolderMessage.text}
          </div>
        )}

        <CreateFolderModal
          isOpen={showCreateFolderModal}
          onClose={() => setShowCreateFolderModal(false)}
          onCreateFolder={handleCreateFolder}
          isLoading={createFolderLoading}
        />
      </div>
    </div>
  );
}
