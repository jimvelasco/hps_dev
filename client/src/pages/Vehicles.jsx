import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import { useLoggedInUser } from "../hooks/useLoggedInUser";
import axios from "../services/api";
import DashboardNavbar from "../components/DashboardNavbar";
import { getVehicleActiveStatusBoolean } from "../utils/vehicleHelpers";

export default function Vehicles() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState(null);
  const [sortColumn, setSortColumn] = useState("plate");
  const [sortDirection, setSortDirection] = useState("asc");
  const { clearLoggedInUser, getLoggedInUser } = useLoggedInUser();
  const loggedInUser = getLoggedInUser();
  const [role, setRole] = useState(loggedInUser.role);
  const [ownerId, setOwnerId] = useState(loggedInUser._id);
  const [filterType, setFilterType] = useState("owner");
  const [filterDate, setFilterDate] = useState("");
  const [allVehicles, setAllVehicles] = useState([]);



  useEffect(() => {
    // console.log("Vehicles.jsx role:", role);
    // console.log("Vehicles.jsx ownerId:", ownerId);
    if (hoaId) {
      const fetchVehicles = async () => {
        try {
          setVehiclesLoading(true);
          const qry = `/vehicles/${hoaId}`
          //  console.log("Vehicles.jsx qry:", qry);
          const response = await axios.get(qry);
          const updatedVehicles = response.data.map(v => ({
            ...v,
            calculatedActiveFlag: getVehicleActiveStatusBoolean(v)
          }));
          setVehicles(updatedVehicles);
          setAllVehicles(updatedVehicles);
          setVehiclesError(null);
        } catch (err) {
          setVehiclesError(err.message || "Failed to load vehicles");
          console.error("Error fetching vehicles:", err);
        } finally {
          setVehiclesLoading(false);
        }
      };
      fetchVehicles();
    }
  }, [hoaId]);

  useEffect(() => {
    if (allVehicles.length > 0) {
      handleFilterApply();
    }
  }, [allVehicles, filterType, filterDate]);


  if (loading) {
    return <div className="ajaxloader">Loading Vehicle data...</div>;
  }

  if (error) {
    setAppError(error);
    navigate(`/${hoaId}/error`);
    return null;
  }

  const handleBackToDashboard = () => {
    navigate(`/${hoaId}/dashboard`);
  };

  const handleSort = (column) => {
    let newDirection = "asc";
    if (sortColumn === column && sortDirection === "asc") {
      newDirection = "desc";
    }

    setSortColumn(column);
    setSortDirection(newDirection);

    const sorted = [...vehicles].sort((a, b) => {
      let valueA, valueB;

      if (column === "plate") {
        valueA = (a.plate || "").toLowerCase();
        valueB = (b.plate || "").toLowerCase();
      } else if (column === "owner") {
        valueA = (a.carowner_lname || "").toLowerCase();
        valueB = (b.carowner_lname || "").toLowerCase();
      } else if (column === "enddate") {
        // valueA = (new Date(a.enddate).toISOString().substring(0, 10));
        // valueB = (new Date(b.enddate).toISOString().substring(0, 10));
        valueA = (a.enddate || "").toLowerCase();
        valueB = (b.enddate || "").toLowerCase();
      } else if (column === "active") {
        valueA = a.calculatedActiveFlag || "";
        valueB = b.calculatedActiveFlag || "";
      }
      if (newDirection === "asc") {
        return String(valueA).localeCompare(String(valueB));
      } else {
        return String(valueB).localeCompare(String(valueA));
      }
    });
    setVehicles(sorted);
  };

  const handleFilterApply = () => {
    let filtered = [...allVehicles];
    if (filterType === "owner") {
      filtered = filtered.filter(v => v.carownertype === "owner");
    } else if (filterType === "renter") {
      filtered = filtered.filter(v => v.carownertype === "renter");
    }

    if (filterDate) {
      const filterDateObj = filterDate;
      filtered = filtered.filter(v => {
        const checkoutDate = v.enddate;
        return checkoutDate >= filterDateObj;
      });
    }
    setVehicles(filtered);
  };

  const handleDetailsClick = (vid) => {
    const qry = `/${hoaId}/vehicledetails/modify/${vid}`;
    console.log("ownervehicles.js handleDetailsClick clicked qry", qry);
    navigate(qry);
  };

  const handleCreateClick = () => {
    const qry = `/${hoaId}/vehicledetails/create/999999999999`;
    console.log("ownervehicles.js handleCreateClick clicked qry", qry);
    navigate(qry);
  };

  const navButtons = [
    {
      label: "Back to Dashboard",
      onClick: handleBackToDashboard,
      color: "#1976d2",
      hoverColor: "#1565c0"
    }
  ];
  let backgroundImage = '';
  if (hoa) {
    backgroundImage = hoa.background_image_url;
  }

  // vehicles.forEach(el => {
  //      console.log("plate active",el.plate,el.active_flag);
  // });

  return (
    <div style={{ minHeight: "100vh", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", 
    backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <DashboardNavbar title={`Owner Vehicles - ${hoa?.name || "HOA"}`} buttons={navButtons} />

      <div className="page-content">
        {/* <h1 style={{ color: "#333" }}>Owner Vehicles</h1> */}

        <div className="flexLayout">
          <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
            <label className="input-label">
              Filter Vehicles:
            </label>
            <select className="standardselect"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="owner">Owner</option>
              <option value="renter">Renter</option>
              <option value="both">Both</option>
              {/* <option value="both">Both</option> */}
            </select>
            <label className="input-label">
              From Date:
            </label>
            <input className="input-date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <button className="standardbutton"
            onClick={handleCreateClick}
           
          >
            Create New Vehicle
          </button>
        </div>



        {vehiclesError && (
          <div style={{
            backgroundColor: "#ffebee",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #ef5350",
            marginBottom: "20px",
            color: "#c62828"
          }}>
            <p><strong>Error:</strong> {vehiclesError}</p>
          </div>
        )}

        {vehiclesLoading ? (
          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
          }}>
            <p style={{ color: "#666" }}>Loading vehicles...</p>
          </div>
        ) : vehicles && vehicles.length > 0 ? (
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            overflow: "hidden"
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>
              <thead>
                <tr style={{
                  backgroundColor: "#1976d2",
                  color: "white"
                }}>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold", cursor: "pointer" }}>
                    <span
                      onClick={() => handleSort("owner")}
                      style={{
                        textDecoration: "underline",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px"
                      }}
                    >
                      Owner Name {sortColumn === "owner" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                    </span>
                  </th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Type</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Make</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Model</th>
                  {/* <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Year</th> */}
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold", cursor: "pointer" }}>
                    <span
                      onClick={() => handleSort("plate")}
                      style={{
                        textDecoration: "underline",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px"
                      }}
                    >
                      Plate {sortColumn === "plate" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                    </span>
                  </th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold", cursor: "pointer" }}>
                    <span
                      onClick={() => handleSort("enddate")}
                      style={{
                        textDecoration: "underline",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px"
                      }}
                    >
                      Check Out {sortColumn === "enddate" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                    </span>
                  </th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold", cursor: "pointer" }}>
                    <span
                      onClick={() => handleSort("active")}
                      style={{
                        textDecoration: "underline",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px"
                      }}
                    >
                      Active {sortColumn === "active" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                    </span>
                  </th>
                  {/* //  <th style={{ padding: "15px", textAlign: "left", fontWeight: "bold" }}>Active</th> */}
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle, index) => (
                  <tr key={vehicle._id || index} style={{
                    borderBottom: "1px solid #e0e0e0",
                    backgroundColor: index % 2 === 0 ? "#fafafa" : "white"
                  }}>
                    <td style={{ padding: "15px" }}>
                      {vehicle.carowner_lname}, {vehicle.carowner_fname}  {vehicle.carownertype}
                    </td>
                    <td style={{ padding: "15px" }}>{vehicle.vehicle_type || "N/A"}</td>
                    <td style={{ padding: "15px" }}>{vehicle.make || "N/A"}</td>
                    <td style={{ padding: "15px" }}>{vehicle.model || "N/A"}</td>
                    {/* <td style={{ padding: "15px" }}>{vehicle.year || "N/A"}</td> */}
                    {/* <td style={{ padding: "15px" }}>
                      {vehicle.plate} {vehicle.plate_state && `(${vehicle.plate_state})`}
                    </td> */}
                    <td style={{ padding: "15px" }}>
                      <button
                        onClick={() => handleDetailsClick(vehicle._id)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "4px",
                          //   backgroundColor: vehicle.active_flag ? "#c8e6c9" : "#ffccbc",
                          //   color: vehicle.active_flag ? "#2e7d32" : "#d84315",
                          backgroundColor: "#c8e6c9",
                          color: "#2e7d32",
                          fontWeight: "bold",
                          border: "none",
                          cursor: "pointer",
                          textDecoration: "none"
                        }}
                        onMouseOver={(e) => {
                          e.target.style.opacity = "0.8";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.opacity = "1";
                        }}
                      >
                        {vehicle.plate} {vehicle.plate_state && `(${vehicle.plate_state})`}
                      </button>
                    </td>



                    <td style={{ padding: "15px" }}>{vehicle.enddate}</td>
                    <td style={{ padding: "15px" }}> {getVehicleActiveStatusBoolean(vehicle) ? "Yes" : "No"}
                      {/* &nbsp;{vehicle.active_flag} */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
          }}>
            <p style={{ color: "#666" }}>No vehicles found for this HOA.</p>
          </div>
        )}
      </div>
    </div>
  );
}
