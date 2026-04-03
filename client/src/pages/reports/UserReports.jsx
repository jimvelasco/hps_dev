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

  const handleOwnerListClick = () => {
    navigate(`/${hoaId}/owner-list`);
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
      

        <div className="grid-flex-container">
          <section className="standardsection" style={{minHeight:"176px"}}>
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

          <section className="standardsection"  style={{minHeight:"176px"}}>
            <h3 style={{ color: "#e91e63", marginTop: 0 }}>Owner List</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              A list of all owners with their contact details.
            </p>
            <button 
              className="standardsubmitbutton" 
              onClick={handleOwnerListClick}
              style={{ width: "200px" }}
            >
              Owner List
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
