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
  const [ownerTypeFilter, setOwnerTypeFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("");
  const [deleteDate, setDeleteDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const vehicleOwnerTypeAry = hoa?.parking_types_array ?? [];

    const formatLocalDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;


  useEffect(() => {
    if (loggedInUser && loggedInUser.role !== 'admin') {
      setUnitFilter(loggedInUser.unitnumber || "");
    }
  }, [loggedInUser]);

  // qry = `/vehicles/adminvehicles/${hoaId}`

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        // const response = await axios.get(`/vehicles/hpsrecords/${hoaId}`);
        const response = await axios.get(`/vehicles/adminvehicles/${hoaId}`);
      //  console.log(response.data)

        const sortedRecords = [...response.data].sort((a, b) =>
          (a.startdate ?? "").localeCompare(b.startdate ?? "")
        );
        setRecords(sortedRecords);
         const sdate = new Date();
        sdate.setDate(sdate.getDate() - 30);
        setStartDate(formatLocalDate(sdate))
        setEndDate(formatLocalDate(new Date()))
        
      } catch (err) {
        setError(err.message || "Failed to fetch records");
        console.error("Error fetching HOA records:", err);
      } finally {
        setLoading(false);
      }
    };

    if (hoaId) {
      fetchRecords();
    }
  }, [hoaId]);

  // const handleDeleteBeforeDate = async () => {
  //   if (!deleteDate) {
  //     alert("Please select a date first.");
  //     return;
  //   }

  //   if (!window.confirm(`Are you sure you want to delete all HOA records created before ${deleteDate}?`)) {
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     const response = await axios.delete(`/vehicles/hpsrecords/${hoaId}?date=${deleteDate}`);
  //     alert(response.data.message);
  //     // Refresh records after deletion
  //     const refreshResponse = await axios.get(`/vehicles/hpsrecords/${hoaId}`);
  //     setRecords(refreshResponse.data);
  //   } catch (err) {
  //     setError(err.message || "Failed to delete records");
  //     console.error("Error deleting HOA records:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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

  const handleGoBack = () => {
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

  const filteredRecords = records.filter(record => {
    const matchesOwnerType = ownerTypeFilter === "all" || record.carownertype === ownerTypeFilter;
    const matchesUnit = !unitFilter || record.unitnumber === unitFilter;
    const matchesStartDate = !startDate || (record.startdate && record.startdate >= startDate);
    const matchesEndDate = !endDate || (record.enddate && record.enddate <= endDate);
    return matchesOwnerType && matchesUnit && matchesStartDate && matchesEndDate;
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
      <DashboardNavbar title="Usage Report" title2={hoa && hoa.name} buttons={navButtons} />

      <div className="page-content">
        <div className="standardtitlebar800">
          <h1 style={{ fontSize: "24px" }}>Usage Report</h1>
        </div>

        <div style={{
          marginTop: "20px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>
          <div className="generic-grid-fr ">
            <div>
              <b>Owner Type</b>
            </div>
            <div>
              <b>Unit Number</b>
            </div>
            <div>
              <b>Start Date</b>
            </div>
            <div>
              <b>End Date</b>
            </div>
            <div>
             &nbsp;
            </div>
            {/* <div>
             &nbsp;
            </div> */}
          </div>
           <div className="generic-grid-fr ">
            <div>
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
              {/* <option value="">All Owner Types</option> */}
               {vehicleOwnerTypeAry.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
                 <option value="renter">Renter</option>
              <option value="dayuseonly">Day Pass</option>
              <option value="all">All</option>
            </select>
            </div>
            <div>
               {loggedInUser && loggedInUser.role === 'admin' ? (
              <div>
                
                
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
            </div>
            <div>
              <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="standardinput"
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc"
                  }}
                />
            </div>
             <div>
              <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="standardinput"
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc"
                  }}
                />
            </div>

{/* 
            <div>
               <button
                  onClick={handleGoBack}
                  className="btns btn-primary"
                  
                >
                  Submit
                </button>
            </div> */}
           
          </div>

           {loading ? (
                      <p>Loading records...</p>
                    ) : error ? (
                      <p style={{ color: "red" }}>Error: {error}</p>
                    ) : filteredRecords.length === 0 ? (
                      <p>No records found.</p>
                    ) : (
                      <div style={{ overflowX: "auto", maxWidth: "100%" }}>
                        <div style={{marginTop:"20px"}}>Count: {filteredRecords.length}</div>
                      <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: " 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
                        gap: "0px",
                        marginTop: "10px" ,
                        minWidth: "800px",
                        overflowX: "auto"
                      }}>
                         <div className="standard-table-header">Start Date</div>
                         <div className="standard-table-header">End Date</div>
                          <div className="standard-table-header">Days</div>
                         <div className="standard-table-header">Unit</div>
                        
                          <div className="standard-table-header">Name</div>
                           <div className="standard-table-header">Type</div>
                         <div className="standard-table-header">Plate</div>
                        
          
                         {filteredRecords.map((record, index) => {
                           let hasOverlap = false;
                           if (index > 0) {
                             const prevRecord = filteredRecords[index - 1];
                             // Simple date string comparison works for YYYY-MM-DD
                             const s1 = record.startdate || "";
                             const e1 = record.enddate || "";
                             const s2 = prevRecord.startdate || "";
                             const e2 = prevRecord.enddate || "";
                             
                            //  if (s1 && e1 && s2 && e2) {
                            //    // Check overlap: (StartA <= EndB) && (EndA >= StartB)
                            //    if (s1 <= e2 && e1 >= s2) {
                            //    //  hasOverlap = true;
                            //    }
                            //  }
                             // assumes records are ordered by start date. If the second record start date 
                             // is in between the previous records start and end date it gets flagged
                            //   if (s1 && e1 && s2 && e2) {
                            //    if (s1 >= s2  && s1 < e2) {
                            //      hasOverlap = true;
                            //    }
                            //  }
                           }
          
                           return (
                             <React.Fragment key={record._id || index}>
                               <div className="standard-table-cell" >{record.startdate}</div>
                               <div className="standard-table-cell" >{record.enddate}</div>
                               <div className="standard-table-cell" >{calculateDays(record.startdate, record.enddate)}</div>
                               <div className="standard-table-cell" >{record.unitnumber}</div>
                               <div className="standard-table-cell" >{`${record.carowner_fname} ${record.carowner_lname}`}</div>
                               <div className="standard-table-cell" >{record.carownertype}</div>
                               <div className="standard-table-cell" >{record.plate}</div>
                             </React.Fragment>
                           );
                         })}
                      </div>
          
                      </div>
                       
                    )}

        </div>
      </div>
    </div>
  )
}