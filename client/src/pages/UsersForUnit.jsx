import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useError } from "../context/ErrorContext";
import { useHoa } from "../context/HoaContext";
import { getAWSResource } from "../utils/awsHelper";
import DashboardNavbar from "../components/DashboardNavbar";


export default function ErrorPage() {
  const navigate = useNavigate();
  const { hoaId } = useParams();
  const { error, clearError } = useError();
  const { hoa, loading, error: hoaError, fetchHoaById } = useHoa();


  const handleBackClick = () => {
   
     navigate(-1);
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



  if (!hoa) {
    return null
  } else {
    return (
      <div style={{
        minHeight: "100vh", backgroundColor: "#f5f5f5",
        backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover",
        backgroundPosition: "center", backgroundAttachment: "fixed"
      }}>
         <DashboardNavbar title="Update Unit Parking" title2={hoa && hoa.name} buttons={navButtons} />

        <div className="page-content">
           <div className="standardtitlebar800">
          <h1 style={{ fontSize: "24px" }}>Users for Unit</h1>
        </div>
      
          <div className="button-grid">
           
          </div>
        </div>
      </div>
  );
  }
}
