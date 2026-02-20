import React, { use, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import { useLoggedInUser } from "../hooks/useLoggedInUser";
import axios from "../services/api";
import DashboardNavbar from "../components/DashboardNavbar";
import VehiclesGrid from "../components/VehiclesGrid";
import VehiclesGridPhone from "../components/VehiclesGridPhone";
import VehiclesTableUpdate from "../components/VehiclesTableUpdate";
import { getVehicleActiveStatusBoolean, utcDateOnly } from "../utils/vehicleHelpers";
import ModalAlert from "../components/ModalAlert";
import { getAWSResource } from "../utils/awsHelper";


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
  const [isVisible, setIsVisible] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null, onCancel: null });
  const [showTable, setShowTable] = useState(false);
  const [showFilters, setShowFilters] = useState(false);



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
          console.log("OwnerVehicles.jsx qry:", qry);
          if (role === "admin" || role === "manager") {

            qry = `/vehicles/${hoaId}`
          }

         //  console.log("OwnerVehicles.jsx qry:", qry);
          const response = await axios.get(qry);
         console.log("fetchVehicles client received:", response.data.length)
          const updatedVehicles = response.data.map(v => ({
            ...v,
            calculatedActiveFlag: getVehicleActiveStatusBoolean(v)
          }));

          //  console.log("updatedVehicles client received:", updatedVehicles.length)

          updatedVehicles.sort((a, b) => {
            let valueA, valueB;
            valueA = a.calculatedActiveFlag || "";
            valueB = b.calculatedActiveFlag || "";
            return String(valueB).localeCompare(String(valueA));
          });

          //console.log("updatedVehicles length about to set", updatedVehicles.length)

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
  }, [hoaId, ownerId]);

  useEffect(() => {
    if (allVehicles.length > 0) {
      const today = new Date();
      const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
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
      } else if (column === "ownertype") {
        valueA = (a.carownertype || "").toLowerCase();
        valueB = (b.carownertype || "").toLowerCase();
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
    //  console.log("ENTRY **** FILTER APPLIED LEN",filterType,filtered.length)
    if (filterType === "owner") {
      filtered = filtered.filter(v => v.carownertype === "owner" || v.carownertype === "friend" || v.carownertype === "family");
    } else if (filterType === "renter") {
      filtered = filtered.filter(v => v.carownertype === "renter");
    }
    // if (filterDate) {
    //   const filterDateObj = filterDate;
    //   filtered = filtered.filter(v => {
    //     const checkoutDate = v.enddate;
    //     return checkoutDate >= filterDateObj;
    //   });
    // }

    // why was this put in ?
    // if (filterDate && filterType === "renter") {
    //   const filterDateObj = filterDate;
    //   filtered = filtered.filter(v => {
    //     const checkoutDate = v.enddate;
    //     return checkoutDate >= filterDateObj;
    //   });
    // }
    //  console.log("FILTER APPLIED LEN",filterType,filtered.length)
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
  const handleShowHidenClick = () => {
    setIsVisible(!isVisible)
  }
   const handleShowFilterClick = () => {
    setShowFilters(!showFilters)
  }
  const handleShowTableClick = () => {
    setShowVisible(!isVisible)
  }

  const handleShowTable = () => {
    if (showTable) {
      setShowTable(false)
    } else {
      setShowTable(true)
    }
  };

  const navButtons = [
    {
      label: "Back",
      onClick: handleBackToDashboard,
      which: "goback"
    }
  ];
  let backgroundImage = '';
  let ttitle2 = "";
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
    ttitle2 = hoa.name + " -  " + role;
    // console.log("VEHICLES LENGTH IS ",vehicles.length );
  }
  return (
    <div style={{ minHeight: "100vh", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <DashboardNavbar title="Owner Vehicles" title2={ttitle2} buttons={navButtons} />
      <div className="page-content">

        <div className="standardtitlebar">
          <div className="button-grid">
            <button className="navbutton2"
              onClick={handleShowTable}>
              {showTable ? "Hide Table" : "Show Table"}
            </button>

             {/* <button className="navbutton3"
              onClick={handleShowFilterClick}>
              {!showFilters ? "Sort" : "Hide"}
            </button> */}





            {/* <div>
              <div style={{fontSize:"12px"}}>Type</div>
              <select className="standardselect"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="owner">Owner</option>
                <option value="renter">Renter</option>
              </select>
            </div> */}


            {/* <div>
               <div style={{fontSize:"12px"}}>Since</div>
              <input className="input-date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                disabled={filterType === "renter" ? false : true }
              />
            </div> */}







            {loggedInUser && loggedInUser.role !== "admin" && (
              <button className="navbutton2"
                onClick={() => handleCreateClick()}>
                New Vehicle
              </button>



            )}


          </div>
        </div>
        <div style={{textAlign:'center',marginTop:'-15px',marginBottom:'5px'}}>
         <button className="navbutton3"
              onClick={handleShowFilterClick}>
              {!showFilters ? "Sort" : "Hide"}
            </button>
            </div>

        <div style={{ display: isVisible ? "block" : "block" }}>


          {/* <div className="standardtitlebar" style={{ width: "50%" }}>


            <div className="button-grid">
              <div>
                <div style={{ marginBottom: "10px" }}><b>Type</b></div>
                <select className="standardselect"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="owner">Owner</option>
                  <option value="renter">Renter</option>
                </select>
              </div>
              <div>
                <div style={{ marginBottom: "10px" }}><b>From</b></div>
                <input className="input-date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  disabled={showTable}
                />
              </div>
            </div>


          </div> */}


          {showFilters && (
            <div className="standardtitlebar">
              {/* <div style={{ marginBottom: "10px" }}><b>Sort</b></div> */}
              <div className="button-grid">
                <button className="btnxsp "
                  onClick={() => handleSort("owner")}>
                  Owner
                </button>
                <button className="btnxsp "
                  onClick={() => handleSort("ownertype")}>
                  Type
                </button>
                <button className="btnxsp"
                  onClick={() => handleSort("plate")}>
                  Plate
                </button>
                <button className="btnxsp "
                  onClick={() => handleSort("enddate")}>
                  Checkout
                </button>
                <button className="btnxsp "
                  onClick={() => handleSort("active")}>
                  Active
                </button>
              </div>
            </div>
          )}

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

            {/*<div className="xphoneview">
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

            {showTable ? (
              <div style={{ overflowX: "auto", maxWidth: "100%" }}>
                <div style={{
                  minWidth: "800px",
                  overflowX: "auto"
                }}>
                  <div className='grid-flex-container'>
                    <VehiclesTableUpdate
                      vehicles={vehicles}
                      role={role}
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      handleSort={handleSort}
                      handleDetailsClick={handleDetailsClick}
                      handlePaymentClick={handlePaymentClick}
                      getVehicleActiveStatusBoolean={getVehicleActiveStatusBoolean}
                      utcDateOnly={utcDateOnly}
                    />
                  </div>
                </div>
              </div>

            ) : (


              <VehiclesGridPhone
                vehicles={vehicles}
                role={role}
                // sortColumn={sortColumn}
                // sortDirection={sortDirection}
                // handleSort={handleSort}
                handleDetailsClick={handleDetailsClick}
                handlePaymentClick={handlePaymentClick}
                getVehicleActiveStatusBoolean={getVehicleActiveStatusBoolean}
                utcDateOnly={utcDateOnly}
              />
            )}
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
