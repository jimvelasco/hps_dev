import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/api";
import { useHoa } from "../../context/HoaContext";
import DashboardNavbar from "../../components/DashboardNavbar";
import { getAWSResource } from "../../utils/awsHelper";

export default function HPSRecordReport() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading: hoaLoading } = useHoa();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ownerTypeFilter, setOwnerTypeFilter] = useState("");

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
    const matchesSearch = (record.plate || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.unitnumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.lastname || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOwnerType = !ownerTypeFilter || record.ownertype === ownerTypeFilter;
    
    return matchesSearch && matchesOwnerType;
  });

  if (hoaLoading) {
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
          <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Search by Plate, Unit, or Last Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="standardinput"
              style={{ maxWidth: "400px" }}
            />
            <select
              value={ownerTypeFilter}
              onChange={(e) => setOwnerTypeFilter(e.target.value)}
              className="standardinput"
              style={{ maxWidth: "200px" }}
            >
              <option value="">All Owner Types</option>
              <option value="owner">Owner</option>
              <option value="renter">Renter</option>
            </select>
          </div>

          {loading ? (
            <p>Loading records...</p>
          ) : error ? (
            <p style={{ color: "red" }}>Error: {error}</p>
          ) : filteredRecords.length === 0 ? (
            <p>No records found.</p>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1.2fr 0.8fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr",
              gap: "0px",
              marginTop: "20px" 
            }}>
               <div className="standard-table-header">Date</div>
               <div className="standard-table-header">Unit</div>
               <div className="standard-table-header">Name</div>
                <div className="standard-table-header">Created</div>
                <div className="standard-table-header">Type</div>
               <div className="standard-table-header">Plate</div>
               <div className="standard-table-header">Start</div>
               <div className="standard-table-header">End</div>

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
                      <div className="standard-table-cell" style={{ color: hasOverlap ? 'red' : 'inherit', fontWeight: hasOverlap ? 'bold' : 'normal' }}>{record.createdAt}</div>
                     <div className="standard-table-cell" style={{ color: hasOverlap ? 'red' : 'inherit', fontWeight: hasOverlap ? 'bold' : 'normal' }}>{record.ownertype}</div>
                      <div className="standard-table-cell" style={{ color: hasOverlap ? 'red' : 'inherit', fontWeight: hasOverlap ? 'bold' : 'normal' }}>{record.plate}</div>
                     <div className="standard-table-cell" style={{ color: hasOverlap ? 'red' : 'inherit', fontWeight: hasOverlap ? 'bold' : 'normal' }}>{record.startdate}</div>
                     <div className="standard-table-cell" style={{ color: hasOverlap ? 'red' : 'inherit', fontWeight: hasOverlap ? 'bold' : 'normal' }}>{record.enddate}</div>
                   </React.Fragment>
                 );
               })}
            </div>
             
          )}
        </div>
      </div>
    </div>
  );
}
