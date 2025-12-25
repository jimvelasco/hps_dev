import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import { useLoggedInUser } from "../hooks/useLoggedInUser";
import DashboardNavbar from "../components/DashboardNavbar";

export default function Notifications() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const { clearLoggedInUser } = useLoggedInUser();

  // useEffect(() => {
  //   if (hoaId) {
  //     fetchHoaById(hoaId).catch((err) => {
  //       setAppError(err.message || "Failed to load HOA data");
  //       navigate(`/${hoaId}/error`);
  //     });
  //   }
  // }, [hoaId, fetchHoaById, setAppError, navigate]);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading HOA data...</div>;
  }

  if (error) {
    setAppError(error);
    navigate(`/${hoaId}/error`);
    return null;
  }

  

  const handleBackToDashboard = () => {
    navigate(`/${hoaId}/dashboard`);
  };
 

  const navButtons = [
    {
      label: "Back",
      onClick: handleBackToDashboard,
      which:"goback"
    }
  ];
   let backgroundImage = '';
  if (hoa) {
    backgroundImage = hoa.background_image_url;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed"   }}>
      <DashboardNavbar title="Notifications" buttons={navButtons} />

      <div className="page-content">

         <div className="standardtitlebar">
          <h1>Notifications</h1>
        </div>
      

        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          marginBottom: "20px"
        }}>
          <p style={{ color: "#666", marginBottom: "10px" }}>
            <strong>HOA ID:</strong> {hoaId}
          </p>
          <p style={{ color: "#666" }}>
            <strong>HOA Name:</strong> {hoa?.name || "N/A"}
          </p>
        </div>

        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>
          <p style={{ color: "#666" }}>No notifications at this time.</p>
        </div>
      </div>
    </div>
  );
}
