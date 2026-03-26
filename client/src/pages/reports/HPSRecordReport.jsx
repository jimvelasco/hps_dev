import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/api";
import { useHoa } from "../../context/HoaContext";
import { useLoggedInUser } from "../../hooks/useLoggedInUser";
import DashboardNavbar from "../../components/DashboardNavbar";
import { getAWSResource } from "../../utils/awsHelper";

export default function HPSRecordReport() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading: hoaLoading } = useHoa();
  const { user: loggedInUser, loading: userLoading } = useLoggedInUser();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ownerTypeFilter, setOwnerTypeFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [deleteDate, setDeleteDate] = useState("");

  useEffect(() => {
    if (loggedInUser && loggedInUser.role === 'owner') {
      setUnitFilter(loggedInUser.unitnumber || "");
    }
  }, [loggedInUser]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/vehicles/hpsrecords/${hoaId}`);
        setRecords(response.data);
      } catch (err) {
        setError(err.message || "Failed to fetch records");
        console.error("Error fetching HPS records:", err);
      } finally {
        setLoading(false);
      }
    };

    if (hoaId) {
      fetchRecords();
    }
  }, [hoaId]);

  const handleDeleteBeforeDate = async () => {
    if (!deleteDate) {
      alert("Please select a date first.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete all HPS records created before ${deleteDate}?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(`/vehicles/hpsrecords/${hoaId}?date=${deleteDate}`);
      alert(response.data.message);
      // Refresh records after deletion
      const refreshResponse = await axios.get(`/vehicles/hpsrecords/${hoaId}`);
      setRecords(refreshResponse.data);
    } catch (err) {
      setError(err.message || "Failed to delete records");
      console.error("Error deleting HPS records:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return "N/A";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : "N/A";
  };

  const handleBackClick = () => {
    navigate(`/${hoaId}/reports`);
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

  const filteredRecords = records.filter(record => {
    const matchesOwnerType = !ownerTypeFilter || record.ownertype === ownerTypeFilter;
    const matchesUnit = !unitFilter || record.unitnumber === unitFilter;
    return matchesOwnerType && matchesUnit;
  });

  const uniqueUnits = [...new Set(records.map(r => r.unitnumber))].sort((a, b) => 
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );

  if (hoaLoading || userLoading) {
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
      <DashboardNavbar title="HPS Record Report" title2={hoa && hoa.name} buttons={navButtons} />

      <div className="page-content">
        <div className="standardtitlebar">
          <h1 style={{ fontSize: "24px" }}>HPS Record Log</h1>
        </div>

        <div style={{
          marginTop: "20px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>
          {/* <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}> */}
{/* <div style={{ border:"1px solid black",marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap",margin:"auto",alignItems: "center" }}> */}
          <div className="generic-grid ">
            <div>
              <p>Owner Type</p>
            <select
              value={ownerTypeFilter}
              onChange={(e) => setOwnerTypeFilter(e.target.value)}
              className="standardinput"
              style={{
                maxWidth: "200px",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                boxSizing: "border-box"
              }}
            >
              <option value="">All Owner Types</option>
              <option value="owner">Owner</option>
              <option value="renter">Renter</option>
            </select>
            </div>


            {loggedInUser && loggedInUser.role === 'admin' ? (
              <div>
                 <label className="input-label">
                    Unit Number
                  </label>
                
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="standardinput"
                style={{
                  maxWidth: "200px",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box"
                }}
              >
                <option value="">All Units</option>
                {uniqueUnits.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              </div>
            ) : (
              <div>
               <p>Unit Number</p>
              
              <div style={{
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#eee",
                minWidth: "100px",
                // display: "flex",
                alignItems: "center"
              }}>
              {/* <div> */}
                
                Unit: {unitFilter || "N/A"}
              </div>
              </div>
            )}

            {/* {loggedInUser && loggedInUser.role === 'admin' && ( */}
              {/* <div style={{ display: "flex", gap: "10px", alignItems: "center", marginLeft: "auto" }}> */}
               
               <div>
                  <p>Before Date</p>
                 <input
                  type="date"
                  value={deleteDate}
                  onChange={(e) => setDeleteDate(e.target.value)}
                  className="standardinput"
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc"
                  }}
                />
                </div>
                
                <div>
                   <p>&nbsp;</p>

                <button
                  onClick={handleDeleteBeforeDate}
                  className="standardbutton"
                  style={{
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    width:"80px"
                  }}
                >
                  Delete
                </button>
              </div>
            {/*  )} */}
          </div>

          {loading ? (
            <p>Loading records...</p>
          ) : error ? (
            <p style={{ color: "red" }}>Error: {error}</p>
          ) : filteredRecords.length === 0 ? (
            <p>No records found.</p>
          ) : (
            <div style={{ overflowX: "auto", maxWidth: "100%" }}>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1.2fr 0.8fr 1.5fr 0.8fr 1fr 1fr 1fr 1fr .5fr",
              gap: "0px",
              marginTop: "20px" ,
              minWidth: "800px",
              overflowX: "auto"
            }}>
               <div className="standard-table-header">Date</div>
               <div className="standard-table-header">Unit</div>
               <div className="standard-table-header">Name</div>
              
                <div className="standard-table-header">Type</div>
               <div className="standard-table-header">Plate</div>
               <div className="standard-table-header">Start</div>
               <div className="standard-table-header">End</div>
                 <div className="standard-table-header">Days</div>
                  <div className="standard-table-header">RP</div>

               {filteredRecords.map((record, index) => {
                 let hasOverlap = false;
                 if (index > 0) {
                   const prevRecord = filteredRecords[index - 1];
                   // Simple date string comparison works for YYYY-MM-DD
                   const s1 = record.startdate || "";
                   const e1 = record.enddate || "";
                   const s2 = prevRecord.startdate || "";
                   const e2 = prevRecord.enddate || "";
                   
                   if (s1 && e1 && s2 && e2) {
                     // Check overlap: (StartA <= EndB) && (EndA >= StartB)
                     if (s1 <= e2 && e1 >= s2) {
                       hasOverlap = true;
                     }
                   }
                 }

                 return (
                   <React.Fragment key={record._id || index}>
                     <div className="standard-table-cell" style={{ color: hasOverlap ? 'red' : 'inherit', fontWeight: hasOverlap ? 'bold' : 'normal' }}>
                       {new Date(record.createdAt).toLocaleDateString()}
                     </div>
                     <div className="standard-table-cell" style={{ color: hasOverlap ? 'red' : 'inherit', fontWeight: hasOverlap ? 'bold' : 'normal' }}>{record.unitnumber}</div>
                     <div className="standard-table-cell" style={{ color: hasOverlap ? 'red' : 'inherit', fontWeight: hasOverlap ? 'bold' : 'normal' }}>{`${record.firstname} ${record.lastname}`}</div>
                     <div className="standard-table-cell" style={{ color: hasOverlap ? 'red' : 'inherit', fontWeight: hasOverlap ? 'bold' : 'normal' }}>{record.ownertype}</div>
                      <div className="standard-table-cell" style={{ color: hasOverlap ? 'red' : 'inherit', fontWeight: hasOverlap ? 'bold' : 'normal' }}>{record.plate}</div>
                     <div className="standard-table-cell" style={{ color: hasOverlap ? 'red' : 'inherit', fontWeight: hasOverlap ? 'bold' : 'normal' }}>{record.startdate}</div>
                     <div className="standard-table-cell" style={{ color: hasOverlap ? 'red' : 'inherit', fontWeight: hasOverlap ? 'bold' : 'normal' }}>{record.enddate}</div>
                    <div className="standard-table-cell" style={{ color: hasOverlap ? 'red' : 'inherit', fontWeight: hasOverlap ? 'bold' : 'normal' }}>{calculateDays(record.startdate, record.enddate)}</div>
                    <div className="standard-table-cell" style={{ color: hasOverlap ? 'red' : 'inherit', fontWeight: hasOverlap ? 'bold' : 'normal' }}>{record.requires_payment}</div>

                   </React.Fragment>
                 );
               })}
            </div>

            </div>
             
          )}
        </div>
      </div>
    </div>
  );
}
