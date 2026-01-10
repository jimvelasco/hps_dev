import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import axios from "../services/api";
import DashboardNavbar from "../components/DashboardNavbar";
import VehiclesGrid from "../components/VehiclesGrid";
import VehiclesGridPhone from "../components/VehiclesGridPhone";
import { getVehicleActiveStatusBoolean, utcDateOnly } from "../utils/vehicleHelpers";
import ModalAlert from "../components/ModalAlert";
import HoaInformation from "../components/HoaInformation";



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
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null, onCancel: null });


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
          }
        } catch (err) {
          console.error("Error fetching user for unit:", err);
        }
      };
      fetchUserForUnit();
    }
  }, [hoaId, unitNumber]);


  useEffect(() => {
    if (hoaId && unitNumber) {
      const fetchVehicles = async () => {
        try {
          setVehiclesLoading(true);
          //  const response = await axios.get(`/vehicles/${hoaId}/renter/${unitNumber}`);
          const response = await axios.get(`/vehicles/${hoaId}/rentervehicles/${unitNumber}`);
          const updatedVehicles = response.data.map(v => ({
            ...v,
            calculatedActiveFlag: getVehicleActiveStatusBoolean(v)
          }));
          setVehicles(updatedVehicles);
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
  }, [hoaId, unitNumber]);

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
        unitNumber: uid, role: "renter",
        vehicles: vehicles, ownerOfUnit: ownerOfUnit, vehid: vid
      }
    });
  }

  // navigate(qry, { state: { unitNumber: uid, role: arole, numberOfVehicles: vehicles.length } });

  const handleCreateClick = () => {
    if (!ownerOfUnit) {
      alert("Unable to load unit information");
      return;
    }
    const parkingLimit = ownerOfUnit.parking_allowed_renter || 0;
    const renterFreeParking = ownerOfUnit.renter_free_parking || 0;
    const currentVehicleCount = vehicles.length;
    // const spotsTheyCanUse = 1 + (ownerOfUnit?.additional_parking_spots_paid || 0);
    // const nextSpotNumber = currentVehicleCount; // 1 for 2nd vehicle, 2 for 3rd

    if (currentVehicleCount >= parkingLimit) {
      // if (currentVehicleCount >= renterFreeParking) {
      // console.log("*******Parking limit reached, showing modal");
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: `Parking limit reached. Maximum renter parking spots allowed: ${parkingLimit}`,
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
        unitNumber: unitNumber, role: "renter",
        vehicles: vehicles,
        ownerOfUnit: ownerOfUnit,
        vehid: null
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
    // console.log("Payment click for vehicle id:", vid);

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
    backgroundImage = hoa.background_image_url;
  }
  if (!ownerOfUnit) {
    return (<div style={{ padding: "20px" }}>Loading unit information...</div>);
  }

  return (
    <div className="page-background" style={{ backgroundImage: `url('${backgroundImage}')` }}>
      {/* <DashboardNavbar title={`Renter Vehicles - Unit ${unitNumber} - ${hoa?.name || "HOA"}`} buttons={navButtons} /> */}
      <DashboardNavbar title={`Renter Vehicles`} buttons={navButtons} />
      <div className="page-content">

        <div className="standardtitlebar">
          <div className="tableview">
            <label className="input-label">
              Unit: {unitNumber} {ownerOfUnit.first_name} {ownerOfUnit.last_name} {ownerOfUnit.phone}
            </label><br />
            <button className="standardsubmitbutton180"  onClick={handleCreateClick}>
              New Vehicle
            </button>
          </div>
           <div className="phoneview">
            <label className="input-label">
              Unit: {unitNumber} 
            </label>
            <br />
             <label className="input-label">
              {ownerOfUnit.first_name} {ownerOfUnit.last_name} 
            </label>
            <br />
             <label className="input-label">
              {ownerOfUnit.phone}
            </label>
            <br />
            <button className="standardsubmitbutton180"  onClick={handleCreateClick}>
              New Vehicle
            </button>
          </div>
        </div>

        {vehiclesError && (
          <div className="displayerror">
            <p><strong>Error:</strong> {vehiclesError}</p>
          </div>
        )}

        {vehiclesLoading ? (
          <div className="ajaxloading">
            <p className="error-text">Loading vehicles...</p>
          </div>
        ) : vehicles && vehicles.length > 0 ? (
          <>
            {/* <div className="tableview">
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
            </div>
          </>
        ) : (
          <div className="noresultsfound">
            <p className="error-text">No vehicles found for this unit.</p>
          </div>
        )}
        <br />
        <div className="standardtitlebar">
          <label className="input-label">
            Welcome to {hoa?.name}
          </label>
        </div>
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
