import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import axios from "../services/api";
import DashboardNavbar from "../components/DashboardNavbar";
import VehiclesGridPhone from "../components/VehiclesGridPhone";
import { getVehicleActiveStatusBoolean, utcDateOnly } from "../utils/vehicleHelpers";
import ModalAlert from "../components/ModalAlert";
import HoaInformation from "../components/HoaInformation";
import { getAWSResource } from "../utils/awsHelper";



export default function RenterVehicles() {
  const { hoaId, unitNumber } = useParams();
  const navigate = useNavigate();
  //const location = useLocation();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState(null);
  const [sortColumn, setSortColumn] = useState("plate");
  const [sortDirection, setSortDirection] = useState("asc");
  const [userIdForUnit, setUserIdForUnit] = useState(null);
  const [ownerOfUnit, setOwnerOfUnit] = useState(null);
  const [unitForRenter, setUnitForRenter] = useState(null);
  const [pincodeActionLabel, setPincodeActionLabel] = useState("");
  const [disableAddVehicle, setDisableAddVehicle] = useState(false)
  const [allActiveCount, setAllActiveCount] = useState(0);
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null, onCancel: null });
  const location = useLocation();
  const nonownerType = location.state?.nonownerType;
  const nonownerTypeText = location.state?.nonownerTypeText;
  const pincodeAction = location.state?.pincodeAction;
  const pincodeValue = location.state?.pincodeValue;
 
  // from renterlogin the state passed is
  //  navigate(`/${hoaId}/rentervehicles/${encodeURIComponent(unitNumber)}`, {
  //               state: { nonownerType, nonownerTypeText, unitNumber, pincodeValue: pin, pincodeAction: response.data.action }
  //           });
const formatLocalDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;


  useEffect(() => {
    if (hoaId && unitNumber) {
      const fetchUserForUnit = async () => {
        try {
          const response = await axios.get("/users", { params: { hoaId } });
          const user = response.data.find(u => u.unitnumber === unitNumber);
          if (user) {
            // console.log('we found a user for unit:', unitNumber, user);
            setUserIdForUnit(user._id);
            setOwnerOfUnit(user);
            console.log('RV NON OWNER TYPE',nonownerType);
          }
        } catch (err) {
          console.error("Error fetching user for unit:", err);
        }
      };
      fetchUserForUnit();
    }
  }, [hoaId, unitNumber]);

  useEffect(() => {
    setUnitForRenter(null);
    if (!hoaId || !unitNumber) return;
    //console.log('passed action is ',pincodeAction);
    let cancelled = false;
    const fetchUnit = async () => {
      try {
        const response = await axios.get(`/units/${encodeURIComponent(hoaId)}/${encodeURIComponent(unitNumber)}`);
        if (!cancelled) setUnitForRenter(response.data);
      } catch (err) {
        if (!cancelled) console.error("Error fetching unit:", err);
      }
    };

    fetchUnit();
    return () => { cancelled = true; };
  }, [hoaId, unitNumber]);

  useEffect(() => {
    if (hoaId && unitNumber) {
      const fetchVehicles = async () => {
        try {
          setVehiclesLoading(true);
          //  const response = await axios.get(`/vehicles/${hoaId}/renter/${unitNumber}`);
          //     const response = await axios.get(`/vehicles/${hoaId}/rentervehicles/${unitNumber}`);
          let qry = `/vehicles/${hoaId}/allvehicles/${unitNumber}`;

          //  console.log("RenterVehicles.jsx qry:", qry);

          const response = await axios.get(qry);

          const responseData = response.data;
          // responseData.forEach((el, index) => {
          //   console.log(`responseData renters Index ${index}: ${el.enddate}`);
          // });

          //console.log('all vehicles from response ',unitNumber);

          const updatedVehicles = responseData.map(v => ({
            ...v,
            calculatedActiveFlag: getVehicleActiveStatusBoolean(v)
          }));

        //  console.log('updatedVehicles', updatedVehicles.length,updatedVehicles);

          let activeVehicles = updatedVehicles.filter(v => v.calculatedActiveFlag === true);
          setAllActiveCount(activeVehicles.length);

          //      console.log('renter vehicles active vehicles length', activeVehicles.length);

          //     console.log('passed in location state',location.state);


          //   console.log('active vehicles length', activeVehicles.length);

          const nonOwnerVehicles = updatedVehicles.filter(v => {
            if (v.carownertype !== "owner") return true;
          });


          // this is what brings over the template created by the owner for example a visitor   

          // const nonTypeVehicles = nonOwnerVehicles.filter(v => {
          //   if (v.carownertype === nonownerType) return true;
          // });

       //   console.log('NON OWNER VEHICLES', nonOwnerVehicles);
        // JJVFIX this should bring in the visitor from owner inventory. for demo only
        // look at logic here
         const todayUTC = new Date(); // "2025-12-03"
          const todayStr = formatLocalDate(todayUTC); 

          // JJVFIX

        //  console.log('PIN CODE ACTION', pincodeAction,todayStr);

          let nonTypeVehicles = [];
          if (pincodeAction === 'renter') {
             nonTypeVehicles = nonOwnerVehicles.filter(v => {
               if (v.carownertype === pincodeAction && v.enddate >= todayStr) return true;
              //  if (v.carownertype === pincodeAction ) return true;
            });
            setDisableAddVehicle(false);
           } else if (pincodeAction === 'contractor') {
            nonTypeVehicles = nonOwnerVehicles.filter(v => {
              if (v.carownertype === pincodeAction) return true;
            });
            setDisableAddVehicle(true);
            if (unitForRenter.day_use_only === 1) setDisableAddVehicle(false);
             } else if (pincodeAction  === 'visitor') {
            nonTypeVehicles = nonOwnerVehicles.filter(v => {
              if (v.carownertype === 'visitor') return true;
            });
            setDisableAddVehicle(true);
            if (unitForRenter.day_use_only === 1) setDisableAddVehicle(false);
          } 
          // } else if (pincodeAction === 'standard' && nonownerType === 'visitor') {
          //   nonTypeVehicles = nonOwnerVehicles.filter(v => {
          //     if (v.carownertype === nonownerType) return true;
          //   });
          // } 

          // nonTypeVehicles.forEach((el) => {
          //   console.log('EL IS',todayStr,el.plate,el.startdate,el.enddate)
          //   if (el.enddate >= todayStr) {
          //     console.log('we have a winner');
          //   }
          // });
         

          // nonownerType

          // we get the entire batch of vehicles not just the other
          setVehicles(nonTypeVehicles);
          // setVehicles(updatedVehicles);

          if (pincodeAction != 'standard') {
            if (pincodeAction == 'renter') setPincodeActionLabel('(Renter)');
            if (pincodeAction == 'contractor') setPincodeActionLabel('(Contractor)');
            if (pincodeAction == 'visitor') setPincodeActionLabel('(Visitor)');
          }

          // console.log('updatedVehicles',updatedVehicles)
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
  }, [hoaId, unitNumber, nonownerType,unitForRenter]);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading HOA data...</div>;
  }

  if (error) {
    setAppError(error);
    navigate(`/${hoaId}/error`);
    return null;
  }

  const handleBackToLogin = () => {
    navigate(`/${hoaId}/renterslogin`);
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

  const handleDetailsClick = (vehicle) => {

    const vid = vehicle._id;
    const uid = vehicle.unitnumber;

    const qry = `/${hoaId}/vehicledetails/modify/${vid}`;
    navigate(qry, {
      state: {
        unitNumber: uid,
        role: "renter",
        carownertype: vehicle.carownertype,
        vehicles: vehicles,
        ownerOfUnit: ownerOfUnit,
        vehid: vid,
        unit: unitForRenter,
        createdfrom: 'rentervehicles',
        pincodeAction: pincodeAction,
        allActiveVehiclesCount: allActiveCount
      }
    });
  }



  // navigate(qry, { state: { unitNumber: uid, role: arole, numberOfVehicles: vehicles.length } });

  const handleCreateClick = () => {
    if (!ownerOfUnit || !unitForRenter) {
      alert("Unable to load unit information");
      return;
    }
    //  const parkingLimit = unitForRenter.parking_allowed_renter || 0;
    const renterFreeParking = unitForRenter.renter_free_parking || 0;
    const currentVehicleCount = vehicles.length;



    let activeVehicles = vehicles.filter(v => v.calculatedActiveFlag === true);
    let activeVehicleCount = activeVehicles.length;

    const parkingLimitInventory = Number(unitForRenter.inventory_allowed_owner);
    let unitParkingLimit = Number(unitForRenter.parking_allowed_unit);

    // console.log('RV handlecreate allActiveCount unitParkingLimit pa pv',
    //   allActiveCount, unitParkingLimit, pincodeAction, pincodeValue)



    // if (pincodeAction === 'dayuse') {
    //   unitParkingLimit += 1
    // }

    // const spotsTheyCanUse = 1 + (ownerOfUnit?.additional_parking_spots_paid || 0);
    // const nextSpotNumber = currentVehicleCount; // 1 for 2nd vehicle, 2 for 3rd


     let msg = (<>You are not allowed to have <br />more active vehicles than<br /> your parking allowance: {unitParkingLimit}. <br /><br />
        CALL THE OWNER OR ADMIN</>);

    //  msg = (<>You are not allowed to have more active vehicles than your parking allowance. {unitParkingLimit} <br />
    //   Please deactivate another vehicle before activating this one.</>);

    if (allActiveCount >= unitParkingLimit) {
      // if (currentVehicleCount >= renterFreeParking) {
      // console.log("*******Parking limit reached, showing modal");
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: msg,
        //  message: `Free parking limit reached. Maximum renter free parking spots allowed: ${renterFreeParking}`,
        confirmText: "OK",
        // cancelText: "Cancel",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
        },
      });
      return;
    }
    const fakevid = null
    const qry = `/${hoaId}/vehicledetails/create/${userIdForUnit}`;
    //  const qry = `/${hoaId}/vehicledetails/create/${fakevid}`;
    navigate(qry, {
      state: {
        nonownerType: nonownerType,
        unitNumber: unitNumber,
        role: location.state?.nonownerType || "renter",
        vehicles: vehicles,
        ownerOfUnit: ownerOfUnit,
        unit: unitForRenter,
        vehid: null,
        createdfrom: 'rentervehicles',
        pincodeValue: pincodeValue,
        pincodeAction: pincodeAction

      }
    });
    // console.log("Create navigating to:", qry);
    // navigate(qry, { state: { unitNumber } });
    // const { role ,num_vehicles,renter_free_parking} = location.state || {};
  };

  const handlePaymentClick = (vehicle) => {
    if (!ownerOfUnit) {
      alert("Unable to load unit information");
      return;
    }
    console.log("Payment click for vehicle id:", vehicle._id);

    navigate(`/${hoaId}/payment`, {
      state: {
        vehicleId: vehicle._id,
        unitNumber: unitNumber, userId: userIdForUnit, hoaId: hoaId, role: "renter"
      }
    });
  }



  const navButtons = [
    {
      label: "Back",
      onClick: handleBackToLogin,
      which: "goback"
    }
  ];

  let backgroundImage = '';
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
  }
  if (!ownerOfUnit) {
    return (<div style={{ padding: "20px" }}>Loading unit information...</div>);
  }

  const t = nonownerTypeText + ' Vehicles'; // +   localStorage.getItem('unitNumber');
  // const displayedVehicles = vehicles.filter(v => v.carownertype !== "owner");
  const displayedVehicles = [...vehicles];


  return (
    <div className="page-background" style={{ backgroundImage: `url('${backgroundImage}')` }}>
      {/* <DashboardNavbar title={`Renter Vehicles - Unit ${unitNumber} - ${hoa?.name || "HOA"}`} buttons={navButtons} /> */}
      <DashboardNavbar title={t} title2={hoa && hoa.name} buttons={navButtons} />
      <div className="page-content">

        {/* <div className="standardtitlebar">
              <h2>HOA Parking Solutions</h2>
               <label className="input-label">
              Unit: {unitNumber} {ownerOfUnit.first_name} {ownerOfUnit.last_name} {ownerOfUnit.phone}
            </label>
            </div> */}


        <div className="tableview">
          <div className="standardtitlebar320" >
            <label className="input-label2">
              {/* {ownerOfUnit.first_name} {ownerOfUnit.last_name} {ownerOfUnit.phone}  Unit: {unitNumber} */}
              Unit: {unitNumber} {pincodeActionLabel}
            </label><br />
            <div className="button-grid">
              <button className="btns btn-primary" style={{ maxWidth: "150px", marginTop: "5px" }} onClick={handleCreateClick}
               disabled = {disableAddVehicle}
              >
                <FontAwesomeIcon
                  icon={faPlus}
                />  Add Vehicle
               
                

              </button>

            </div>
          </div>
        </div>

        <div className="phoneview">
          <div className="standardtitlebar320">
            <label className="input-label2">
              Unit: {unitNumber} {pincodeActionLabel}
            </label>
            <br />
            <button className="btns btn-primary" style={{ width: "180px", marginTop: "5px" }} onClick={handleCreateClick}>
              <FontAwesomeIcon
                icon={faPlus}
              /> Add Vehicle
            </button>
          </div>
        </div>

        {vehiclesError && (
          <div className="displayerror">
            <p><strong>Error:</strong> {vehiclesError}</p>
          </div>
        )}

        {/* <div className="standardtitlebar2">
          <span><b>Vehicle List</b></span>
        </div> */}

        {vehiclesLoading ? (
          <div className="ajaxloading">
            <p className="error-text">Loading vehicles...</p>
          </div>
          //   ) : vehicles && vehicles.length > 0 ? (
        ) : displayedVehicles.length > 0 ? (

          <>
            {/*
            
             const nonOwnerVehicles = updatedVehicles.filter(v => {
            if (v.carownertype !== "owner") return true;
          });
            
            
            
            <div className="tableview">
              <VehiclesGrid
                vehicles={vehicles}
                role={"renter"}
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
                vehicles={displayedVehicles}
                role={"renter"}
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
            <p className="error-text">No vehicles found.</p>
          </div>
        )}
        <br />
        {/* <div className="standardtitlebar">
          <label className="input-label">
            Welcome to {hoa?.name}
          </label>
        </div> */}
        <HoaInformation hoa={hoa} />
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
