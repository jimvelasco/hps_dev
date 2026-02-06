import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardNavbar from "../../components/DashboardNavbar";
import { useHoa } from "../../context/HoaContext";
import { getAWSResource } from "../../utils/awsHelper";

export default function UserReports() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error } = useHoa();

  const handleBackClick = () => {
    navigate(`/${hoaId}/dashboard`);
  };

  const handleHPSRecordReportClick = () => {
    navigate(`/${hoaId}/hps-record-report`);
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

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return (
    <div style={{
      minHeight: "100vh", 
      backgroundColor: "#f5f5f5",
      backgroundImage: `url('${backgroundImage}')`, 
      backgroundSize: "cover",
      backgroundPosition: "center", 
      backgroundAttachment: "fixed"
    }}>
      <DashboardNavbar title="User Reports" title2={hoa && hoa.name} buttons={navButtons} />

      <div className="page-content">
        <div className="standardtitlebar">
          <h1 style={{ fontSize: "24px" }}>User Reports</h1>
        </div>

        <div className="grid-flex-container">
          <section className="standardsection">
            <h3 style={{ color: "#e91e63", marginTop: 0 }}>HPS Record Log</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              View a detailed log of all HPS records and vehicle changes.
            </p>
            <button 
              className="standardsubmitbutton" 
              onClick={handleHPSRecordReportClick}
              style={{ width: "200px" }}
            >
              View Report
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
