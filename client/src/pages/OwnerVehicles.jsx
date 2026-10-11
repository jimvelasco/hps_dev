import React, { use, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import { useLoggedInUser } from "../hooks/useLoggedInUser";
import axios from "../services/api";
import DashboardNavbar from "../components/DashboardNavbar";
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
  const [plateSearch, setPlateSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [allVehicles, setAllVehicles] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null, onCancel: null });
  const [showTable, setShowTable] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showUnitId, setShowUnitId] = useState("");
  const [unitForOwner, setUnitForOwner] = useState(null);

  // these are vehicle types that will show up on this page
  const [vehicleOwnerTypeAry, setVehicleOwnerTypeArray] = 
  useState(['owner', 'renter','tenant','family','friend','visitor','contractor']);


/*
        return matchingVehicles.filter(v => v.carownertype === "owner" ||
         v.carownertype === "family" ||
          v.carownertype === "family"|| 
          v.carownertype === "contractor");

          <option value="">-- Select type --</option>
          <option value="renter">Short Term Renter</option>
          <option value="tenant">Tenant (Long Term Renter)</option>
          <option value="family">Family</option>
          <option value="friend">Friend</option>
          <option value="visitor">Visitor/Day Guest</option>
          <option value="contractor">Contractor/Vendor</option>
*/

  useEffect(() => {
    if (userLoading) {
      // console.log("OwnerVehicles.jsx userLoading is true")
      return; // Still loading, wait
    }
    // console.log("Token:", localStorage.getItem("token"));
    if (loggedInUser) {
      setRole(loggedInUser.role);
      setOwnerId(loggedInUser._id);
      setShowUnitId(loggedInUser.unitnumber);
      //  console.log("OwnerVehicles.jsx loggedInUser:", loggedInUser);
      //  console.log("OwnerVehicles.jsx loggedInUser unit:", loggedInUser.unitnumber);
    } else {
      console.log("owner vehicles loggedInUser is null")
    }
  }, [loggedInUser, userLoading]);

  useEffect(() => {
    if (userLoading || !hoaId || !loggedInUser?.unitnumber) {
      setUnitForOwner(null);
      return;
    }
    // console.log("WE ARE GETTING THE UNIT");

    let cancelled = false;
    const fetchUnit = async () => {
      try {
        const response = await axios.get(`/units/${encodeURIComponent(hoaId)}/${encodeURIComponent(loggedInUser.unitnumber)}`);
        if (!cancelled) {
          //  console.log('the unit is ',response.data);
          setUnitForOwner(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setUnitForOwner(null);
          console.error("Error fetching unit:", err);
        }
      }
    };

    fetchUnit();
    return () => { cancelled = true; };
  }, [hoaId, userLoading, loggedInUser?.unitnumber]);

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
          //  qry = `/vehicles/${hoaId}/allvehicles/${ownerId}`

          // we get all vehicles for the unit not just the ownerid
          qry = `/vehicles/${hoaId}/allvehicles/${showUnitId}`
          // console.log("OwnerVehicles.jsx qry:", qry);
          if (role === "admin") {

            qry = `/vehicles/adminvehicles/${hoaId}`
          }

          //    console.log("OwnerVehicles.jsx qry:", qry);
          const response = await axios.get(qry);
          //   console.log("fetchVehicles client received:", response.data.length)
          const today = new Date().toLocaleDateString("en-CA");
          const updatedVehicles = response.data.filter(v => {
            if (role === "admin" || v.carownertype !== "renter" || !v.enddate) return true;
            const endDate = new Date(v.enddate);
            return Number.isNaN(endDate.getTime()) || utcDateOnly(endDate) >= today;
          }).map(v => ({
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

          setVehicles(updatedVehicles);
          setAllVehicles(updatedVehicles);
          setVehiclesError(null);
        } catch (err) {
          setVehiclesError(err.message || "Failed to load vehicles");
        //  console.error("Error fetching vehicles:", err);
        } finally {
          setVehiclesLoading(false);
        }
      };

      fetchVehicles();
    }
  }, [hoaId, ownerId, role]);



  useEffect(() => {
    handlePlateSearch(plateSearch);
  }, [allVehicles, filterType, plateSearch]);


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
      }
      else if (column === "unit") {
        valueA = (a.unitnumber || "").toLowerCase();
        valueB = (b.unitnumber || "").toLowerCase();
      }
      else if (column === "enddate") {
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

  const handleFilterApply = (matchingVehicles) => {
    if (filterType === "owner") {
      //return matchingVehicles.filter(v => v.carownertype === "owner" || v.carownertype === "friend" || v.carownertype === "family"|| v.carownertype === "contractor");
     // return matchingVehicles.filter(v => vehicleOwnerTypeAry.includes(v.carownertype)); // === "owner" || v.carownertype === "friend" || v.carownertype === "family"|| v.carownertype === "contractor");
      return matchingVehicles;
    }
    if (filterType === "renter") {
      //return matchingVehicles.filter(v => v.carownertype === "renter");
      return matchingVehicles;
    }
     if (filterType === "all") {
      return matchingVehicles;
    }
    return matchingVehicles;
  };


  const handleDetailsClick = async (vehicle) => {

    const vid = vehicle._id;
    const uid = vehicle.unitnumber;

    try {

      //  console.log('ov handle details click vehicle:', vehicle.carownertype);
// editing allowed for all
      // if (vehicle.carownertype === "renter" && loggedInUser.role !== "admin") {
      //   setModal({
      //     isOpen: true,
      //     type: "alert",
      //     title: "Validation Error",
      //     message: `Owners cannot modify renter vehicles.`,
      //     confirmText: "OK",
      //     onConfirm: () => {
      //       setModal(prev => ({ ...prev, isOpen: false }));
      //     },
      //   });
      //   return;
      // }

      const qry = `/${hoaId}/vehicledetails/modify/${vid}`;
      // console.log("ownervehicles.js handleDetailsClick clicked qry", qry);
      let unitNumber = uid; //loggedInUser ? loggedInUser.unitnumber : "999999999999";
      let arole = "owner";
      navigate(qry, {
        state: {
          unitNumber: unitNumber,
          role: arole,
          carownertype: vehicle.carownertype,
          vehicles: vehicles,
          ownerOfUnit: loggedInUser,
          vehid: vid,
          unit: unitForOwner
        }
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: err.response?.data?.message || err.message || "Failed to load unit inventory limit.",
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
    }
    //vid } });
    //navigate(qry);
  };

  const handleCreateClick = async () => {
    const uid = loggedInUser?.unitnumber;
    if (!hoaId || !uid) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: "Unable to determine the unit for this user.",
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    try {
      const response = await axios.get(`/units/${encodeURIComponent(hoaId)}/${encodeURIComponent(uid)}`);
      const unit = response.data;
      if (!unit) {
        const contact = hoa?.contact_information?.find(item => item.contact_id === "pm_renter");
        const contactDetails = [contact?.phone_description, contact?.phone_number, contact?.email].filter(Boolean).join(" ** ");
        //  const contactDetails = [contact?.phone_description, contact?.phone_number, contact?.email].filter(Boolean);
        let cstr = "";
        // contactDetails.forEach(element => {
        //   cstr += element + "<br />";

        // });
        setModal({
          isOpen: true,
          type: "alert",
          title: "Unit Not Found",
          message: <>Your unit is not registered for this HOA.<br />Please contact {contactDetails || "your property manager"}.</>,
          confirmText: "OK",
          onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
        });
        return;
      }

      setUnitForOwner(unit);
      const parkingLimit = Number(unit.inventory_allowed_owner);
      console.log('parking limit in ow',parkingLimit);
      if (unit.inventory_allowed_owner == null || !Number.isFinite(parkingLimit)) {
        throw new Error("Unit inventory limit is unavailable.");
      }

      if (vehicles.length >= parkingLimit) {
        setModal({
          isOpen: true,
          type: "alert",
          title: "Validation Error",
          message: `Vehicle limit reached. You can only have ${parkingLimit} vehicles in your inventory.`,
          confirmText: "OK",
          onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
        });
        return;
      }

      navigate(`/${hoaId}/vehicledetails/create/${uid}`, {
        state: {
          unitNumber: uid,
          role: loggedInUser.role,
          numberOfVehicles: vehicles.length,
          vehicles: vehicles,
          vehid: null,
          ownerOfUnit: loggedInUser,
          unit,
          createdfrom: 'ownervehicles'
        }
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: err.response?.data?.message || err.message || "Failed to load unit inventory limit.",
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
    }
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
      label: "Dashboard",
      onClick: handleBackToDashboard,
      which: "goback"
    }
  ];
  let backgroundImage = '';
  let ttitle2 = "";
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
    // ttitle2 = hoa.name + " -  " + role;
    ttitle2 = hoa.name;
    // console.log("VEHICLES LENGTH IS ",vehicles.length );
  }

  let titlestr = "Owner Vehicles";
  if (role === "admin") {
    titlestr = "Admininistrator All Vehicles";
  }


  const renderTitleBar = () => {
    return (<div>
      <div className="button-grid">
        {loggedInUser && loggedInUser.role === "admin" && (
          <div>
            <select className="standardselect"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="owner">Owner</option>
              <option value="renter">Renter</option>
               <option value="all">All</option>
            </select>
          </div>
        )}
        <button className="navbutton2"
          onClick={handleShowFilterClick}>
          {/* {!showFilters ? "Sort" : "Hide"} */}
          {showFilters ?
            (<span className="strike">
              Sort</span>)
            : (<span>Sort</span>)
          }
        </button>
        <div>
          <button className="navbutton2"
            onClick={handleShowTable}>
            {/* {showTable ? "Hide Table" : "Show Table"} */}

            {showTable ?
              (<span className="strike">
                Table</span>)
              : (<span>Table</span>)
            }

          </button>
        </div>

        {loggedInUser && loggedInUser.role !== "admin" && (
          <button className="navbutton2"
            onClick={() => handleCreateClick()}>
            New
          </button>
        )}
      </div>
    </div>)
  }

  
  const handlePlateSearch = (searchTerm) => {
    const query = searchTerm.trim().toLowerCase();
    const matchingVehicles = allVehicles.filter(vehicle =>
      (vehicle.plate || "").toLowerCase().includes(query)
    );
    setVehicles(handleFilterApply(matchingVehicles));
  };

  const renderPlateSearch = () => {
    return (
      <div className="standardtitlebar380">
        <label htmlFor="plate-search" style={{marginRight:"10px"}}>Plate Search</label>
        <input
          id="plate-search"
          className="standardinput plate-search-input"
          type="search"
          value={plateSearch}
          onChange={(event) => setPlateSearch(event.target.value)}
          placeholder="Enter license plate"
        />
      </div>
    );
  };


  return (
    <div style={{ minHeight: "100vh", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <DashboardNavbar title={titlestr} title2={ttitle2} buttons={navButtons} />
      <div className="page-content">

        <div className="phoneview">
          <div className="standardtitlebar" style={{ border: "0px solid yellow " }}>
            {renderTitleBar()}
          </div>
        </div>
        <div className="tableview">
          <div className="standardtitlebar380" style={{ border: "0px solid yellow " }}>
            {renderTitleBar()}
          </div>
        </div>


        <div style={{ display: isVisible ? "block" : "block" }}>



          {showFilters && (
            <div className="standardtitlebar">
              {/* <div style={{ marginBottom: "10px" }}><b>Sort</b></div> */}
              <div className="button-grid">
                <button className="btnxsp btn-sort"
                  onClick={() => handleSort("owner")}>
                  Name
                </button>
                <button className="btnxsp btn-sort"
                  onClick={() => handleSort("unit")}>
                  Unit
                </button>
                <button className="btnxsp btn-sort "
                  onClick={() => handleSort("ownertype")}>
                  Type
                </button>
                <button className="btnxsp btn-sort"
                  onClick={() => handleSort("plate")}>
                  Plate
                </button>
                <button className="btnxsp btn-sort "
                  onClick={() => handleSort("enddate")}>
                  Checkout
                </button>
                <button className="btnxsp btn-sort "
                  onClick={() => handleSort("active")}>
                  Active
                </button>
              </div>
            </div>
          )}

        </div>
        {/* <div className="standardtitlebar2">
          <span><b>Vehicle List</b></span>
          
        </div> */}

        {renderPlateSearch()}



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

            ) :

              (

                <div className='grid-flex-container'>

                  <VehiclesGridPhone
                    vehicles={vehicles}
                    role={role}

                    handleDetailsClick={handleDetailsClick}
                    handlePaymentClick={handlePaymentClick}
                    getVehicleActiveStatusBoolean={getVehicleActiveStatusBoolean}
                    utcDateOnly={utcDateOnly}
                  />
                </div>
              )


            }
          </>
        ) : (
          <div className="noresultsfound">
            <p style={{ color: "#666", fontWeight: "bold", textAlign: "center" }}>No vehicles found.</p>
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
