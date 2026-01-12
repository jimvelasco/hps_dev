import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import DashboardNavbar from "../components/DashboardNavbar";
import { getAWSResource } from "../utils/awsHelper";

const tableStyles = `
  @media (width >= 800px) {
    .standard-table {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 10px;
    }
  }

  @media (width < 800px) {
    .standard-table {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
  }

  .standard-table-header {
    background-color: #1976d2;
    color: white;
    font-weight: bold;
    padding: 12px;
    text-align: left;
    border-radius: 4px 4px 0 0;
  }

  .standard-table-cell {
    padding: 12px;
    border-bottom: 1px solid #e0e0e0;
    font-size: 14px;
  }

  .standard-table-row:last-child .standard-table-cell {
    border-bottom: none;
  }
     .violations-one {
    background-color: #1976d2;
    color: white;
    font-weight: bold;
    padding: 12px;
    text-align: left;
    border-radius: 4px 4px 0 0;
  }
      .violations-two {
    background-color: #1976d2;
    color: white;
    font-weight: bold;
    padding: 12px;
    text-align: left;
    border-radius: 4px 4px 0 0;
  }
`;

export default function Violations() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const { setAppError } = useError();

  const violationsData = [
    { unitNumber: "101", type: "Parking", date: "2025-11-20", status: "Open", description: "Unauthorized space", severity: "High", assignedTo: "Manager", resolved: null },
    { unitNumber: "102", type: "Noise", date: "2025-11-18", status: "Resolved", description: "Late night disturbance", severity: "Medium", assignedTo: "Staff", resolved: "2025-11-22" },
    { unitNumber: "103", type: "Maintenance", date: "2025-11-15", status: "In Progress", description: "Broken fence", severity: "High", assignedTo: "Contractor", resolved: null },
    { unitNumber: "104", type: "Pet Policy", date: "2025-11-10", status: "Resolved", description: "Dog without leash", severity: "Low", assignedTo: "Staff", resolved: "2025-11-12" }
  ];

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
      which: 'goback'
    }
  ];
let backgroundImage = '';
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
  }
  
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed"   }}>
      <DashboardNavbar title="Violations" buttons={navButtons} />

      <div className="page-content">

         <div className="standardtitlebar">
          <h1>Violations</h1>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "30px"
        }}>
          <section className="standardsection">
            <h3 style={{ color: "#1976d2", marginTop: 0 }}>HOA Information</h3>
            {hoa && (
              <div>
                <p><strong>HOA Name:</strong> {hoa.name}</p>
                <p><strong>Address:</strong> {hoa.address}</p>
                <p><strong>City:</strong> {hoa.city}, {hoa.state} {hoa.zip}</p>
              </div>
            )}
          </section>

          <section className="standardsection">
            <h3 style={{ color: "#1976d2", marginTop: 0 }}>Violations Overview</h3>
            <p style={{ color: "#666" }}>
              This page displays violations for {hoa?.name}. Violations can be tracked and managed here to ensure community standards are maintained.
            </p>
          </section>
        </div>

        <div style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>
         
          <h3 style={{ color: "#333", marginTop: 0 }}>Active Violations</h3>
          
          <div className="violations-table" style={{ marginTop: "20px" }}>
            <div className="standard-table-header">Unit Number</div>
            <div className="standard-table-header">Type</div>
            <div className="standard-table-header">Date</div>
            <div className="standard-table-header">Status</div>
            <div className="standard-table-header">Description</div>
            <div className="standard-table-header">Severity</div>
            <div className="standard-table-header">Assigned To</div>
            <div className="standard-table-header">Resolved Date</div>

            {violationsData.map((violation, index) => (
              <React.Fragment key={index}>
                <div className="standard-table-cell">{violation.unitNumber}</div>
                <div className="standard-table-cell">{violation.type}</div>
                <div className="standard-table-cell">{violation.date}</div>
                <div className="standard-table-cell">
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: violation.status === "Open" ? "#f57c00" : violation.status === "In Progress" ? "#1976d2" : "#4caf50",
                    color: "white",
                    fontSize: "12px"
                  }}>
                    {violation.status}
                  </span>
                </div>
                <div className="standard-table-cell">{violation.description}</div>
                <div className="standard-table-cell">
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: violation.severity === "High" ? "#d32f2f" : violation.severity === "Medium" ? "#f57c00" : "#4caf50",
                    color: "white",
                    fontSize: "12px"
                  }}>
                    {violation.severity}
                  </span>
                </div>
                <div className="standard-table-cell">{violation.assignedTo}</div>
                <div className="standard-table-cell">{violation.resolved || "—"}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="tableview">what</div>
       <div className="phoneview">where</div>
    </div>
  );
}
