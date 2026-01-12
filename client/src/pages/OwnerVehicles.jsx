import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import { useLoggedInUser } from "../hooks/useLoggedInUser";
import axios from "../services/api";
import DashboardNavbar from "../components/DashboardNavbar";
import VehiclesGrid from "../components/VehiclesGrid";
import VehiclesGridPhone from "../components/VehiclesGridPhone";
import { getVehicleActiveStatusBoolean, utcDateOnly } from "../utils/vehicleHelpers";
import ModalAlert from "../components/ModalAlert";


export default function OwnerVehicles() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState(null);
  const [sortColumn, setSortColumn] = useState("plate");
  const [sortDirection, setSortDirection] = useState("asc");
  const { user: loggedInUser, loading: userLoading, clearLoggedInUser } = useLoggedInUser();
  const [role, setRole] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [filterType, setFilterType] = useState("owner");
  const [filterDate, setFilterDate] = useState("");
  const [allVehicles, setAllVehicles] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null, onCancel: null });


  useEffect(() => {
    if (userLoading) {
      // console.log("OwnerVehicles.jsx userLoading is true")
      return; // Still loading, wait
    }
    // console.log("Token:", localStorage.getItem("token"));
    if (loggedInUser) {
      setRole(loggedInUser.role);
      setOwnerId(loggedInUser._id);
      // console.log("OwnerVehicles.jsx loggedInUser:", loggedInUser);
    } else {
      console.log("owner vehicles loggedInUser is null")
    }
  }, [loggedInUser, userLoading]);

  useEffect(() => {
    //   console.log("Vehicles.jsx role:", role);
    //   console.log("Vehicles.jsx ownerId:", ownerId);
    if (userLoading) {
      //console.log("2nd effect OwnerVehicles.jsx userLoading is true")
      return; // Still loading, wait
    }
    let qry = "";
    if (hoaId) {
      const fetchVehicles = async () => {
        try {
          setVehiclesLoading(true);
          // qry = `/vehicles/${hoaId}/${role}/${ownerId}`
          qry = `/vehicles/${hoaId}/allvehicles/${ownerId}`
          //console.log("OwnerVehicles.jsx qry:", qry);
          if (role === "admin" || role === "manager") {

            qry = `/vehicles/${hoaId}`
          }
          const response = await axios.get(qry);
          const updatedVehicles = response.data.map(v => ({
            ...v,
            calculatedActiveFlag: getVehicleActiveStatusBoolean(v)
          }));



          setVehicles(updatedVehicles);
          setAllVehicles(updatedVehicles);
          setVehiclesError(null);
          // handleFilterApply();
        } catch (err) {
          setVehiclesError(err.message || "Failed to load vehicles");
          console.error("Error fetching vehicles:", err);
        } finally {
          setVehiclesLoading(false);
        }
      };

      fetchVehicles();
      //  handleFilterApply();
    }
  }, [hoaId, ownerId]);

  useEffect(() => {
    if (allVehicles.length > 0) {
      const today = new Date();
      const oneYearAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
      //const formattedDate = oneYearAgo.toISOString().split('T')[0];
      const formattedDate = utcDateOnly(oneYearAgo);
      setFilterDate(formattedDate);
    }
  }, [allVehicles]);

  useEffect(() => {
    if (allVehicles.length > 0) {
      handleFilterApply();
    }
  }, [allVehicles, filterType, filterDate]);


  if (loading) {
    return <div style={{ padding: "20px" }}>Loading Vehicle data...</div>;
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
      filtered = filtered.filter(v => v.carownertype === "owner" || v.carownertype === "friend");
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

  const handleDetailsClick = (vehicle) => {

    const vid = vehicle._id;
    const uid = vehicle.unitnumber;
    //  console.log('ov handle details click vehicle:', vehicle.carownertype);
    if (vehicle.carownertype === "renter") {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: `Owners cannot modify renter vehicles.`,
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
        },
      });
      return;
    }

    const qry = `/${hoaId}/vehicledetails/modify/${vid}`;
    // console.log("ownervehicles.js handleDetailsClick clicked qry", qry);
    let unitNumber = uid; //loggedInUser ? loggedInUser.unitnumber : "999999999999";
    //let arole = loggedInUser ? loggedInUser.role : "owner";
    let arole = "owner";
    //  console.log("loggedInUser", loggedInUser);
    // console.log("****** handleDetailsClick OwnerVehicles.jsx handleDetailsClick loggedInUser:", loggedInUser);
    navigate(qry, {
      state: {
        unitNumber: unitNumber,
        role: arole,
        vehicles: vehicles,
        ownerOfUnit: loggedInUser,
        vehid: vid
      }
    });
    //vid } });
    //navigate(qry);
  };

  const handleCreateClick = () => {
    let uid = loggedInUser ? loggedInUser.unitnumber : "999999999999";
    const qry = `/${hoaId}/vehicledetails/create/${uid}`;
    let arole = loggedInUser ? loggedInUser.role : "owner";
    const parkingLimit = loggedInUser.inventory_allowed_owner;
    const currentVehicleCount = vehicles.length;
    if (currentVehicleCount >= parkingLimit) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: `Vehicle limit reached. You can only have ${parkingLimit} vehicles in your inventory.`,
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
        },
      });
      return;
    }


    navigate(qry, {
      state: {
        unitNumber: uid,
        role: arole,
        numberOfVehicles: vehicles.length,
        vehicles: vehicles,
        vehid: null
      }
    });
    // navigate(qry);
  };
  const handlePaymentClick = (vehicle) => {
    console.log("Payment click for vehicle id:", vehicle._id);
    if (vehicle.carownertype === "renter") {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: `Owners cannot modify renter vehicles.`,
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
        },
      });
      return;
    }

    navigate(`/${hoaId}/payment`, {
      state: {
        vehicleId: vehicle._id,
        unitNumber: loggedInUser.unitnumber, userId: ownerId, hoaId: hoaId, role: "owner"
      }
    });
    // if (role !== "owner") {
    //  setModal({
    //     isOpen: true,
    //     type: "alert",
    //     title: "Information",
    //     message: `Cannot pay for renter vehicle from the owners screen.`,
    //     confirmText: "OK",
    //     onConfirm: () => {
    //       setModal(prev => ({ ...prev, isOpen: false }));
    //     },
    //   });
    //   }
  }
  const navButtons = [
    {
      label: "Back",
      onClick: handleBackToDashboard,
      which: "goback"
    }
  ];
  let backgroundImage = '';
  if (hoa) {
    backgroundImage = hoa.background_image_url;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <DashboardNavbar title={`Owner Vehicles - ${hoa?.name || "HOA"}`} buttons={navButtons} />
      <div className="page-content">

        <div className="tableview">
          <div className="standardtitlebar">
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              marginBottom: '0px'
            }}>
              <div>
                <label className="input-label">
                  Type
                </label>
                <br />
                <select className="standardselect"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="owner">Owner</option>
                  <option value="renter">Renter</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="input-label">
                  From
                </label>
                <br />
                <input className="input-date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
              <div>
                {loggedInUser && loggedInUser.role !== "admin" && (
                  <>
                    <br />
                    <button className="standardsubmitbutton" onClick={() => handleCreateClick()} style={{ width: 80 }}       >
                      New
                    </button>
                  </>
                )
                }


              </div>
            </div>
          </div>
        </div>
        <div className="phoneview">
          <div className="standardtitlebar">
            <div className="grid-container-2x">
              <div>
                <label className="input-label">
                  Type
                </label>
              </div>
              <div>
                <select className="standardselect"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="owner">Owner</option>
                  <option value="renter">Renter</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="input-label">
                  From
                </label>
              </div>
              <div>
                <input className="input-date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
              <div>&nbsp;</div>

              {loggedInUser && loggedInUser.role !== "admin" && (
                <div>
                  <button className="standardsubmitbutton" onClick={() => handleCreateClick()} style={{ width: 80 }}       >
                    New
                  </button>
                </div>
              )
              }
            </div>
          </div>
        </div>




        {vehiclesError && (
          <div className="displayerror">
            <p><strong>Error:</strong> {vehiclesError}</p>
          </div>
        )}

        {vehiclesLoading ? (
          <div className="ajaxloading">
            <p style={{ color: "#666" }}>Loading vehicles...</p>
          </div>
        ) : vehicles && vehicles.length > 0 ? (
          <>
            {/* <div className="tableview">
              <VehiclesGrid
                vehicles={vehicles}
                role={"owner"}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                handleSort={handleSort}
                handleDetailsClick={handleDetailsClick}
                handlePaymentClick={handlePaymentClick}
                getVehicleActiveStatusBoolean={getVehicleActiveStatusBoolean}
                utcDateOnly={utcDateOnly}
              />

            </div> */}
            <div className="xphoneview">
              <VehiclesGridPhone
                vehicles={vehicles}
                role={"owner"}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                handleSort={handleSort}
                handleDetailsClick={handleDetailsClick}
                handlePaymentClick={handlePaymentClick}
                getVehicleActiveStatusBoolean={getVehicleActiveStatusBoolean}
                utcDateOnly={utcDateOnly}
              />
            </div>
          </>
        ) : (
          <div className="noresultsfound">
            <p style={{ color: "#666", fontWeight: "bold", textAlign: "center" }}>No vehicles found for this HOA.</p>
          </div>

        )}
      </div>
      <ModalAlert
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
      />
    </div>
  );
}

// selectstyle={{
//               padding: "8px 12px",
//               borderRadius: "4px",
//               border: "1px solid #ccc",
//               fontSize: "14px",
//               cursor: "pointer"
//             }}

// onMouseEnter={(e) => e.target.style.backgroundColor = "#388e3c"}
// onMouseLeave={(e) => e.target.style.backgroundColor = "#4caf50"}

// style={{ padding: "8px 16px"}}
// style={{
//   padding: "8px 16px",
//   fontSize: "14px",
//   backgroundColor: "#4caf50",
//   color: "white",
//   border: "none",
//   borderRadius: "4px",
//   cursor: "pointer",
//   fontWeight: "bold",
//   transition: "background-color 0.3s ease"
// }}
