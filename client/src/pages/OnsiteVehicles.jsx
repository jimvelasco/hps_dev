import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../services/api";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import DashboardNavbar from "../components/DashboardNavbar";
import { getVehicleActiveStatusBoolean, getVehicleIsActiveTodayBoolean, formatPhoneNumber, utcDateOnly } from "../utils/vehicleHelpers";
import TableButton from "../components/TableButton";
import ViolationsAccordion from "../components/ViolationsAccordion";
import { getAWSResource } from "../utils/awsHelper";
import VehiclesTableOnsite from "../components/VehiclesTableOnsite";
import VehiclesGridOS from "../components/VehiclesGridOS";
import VehiclesGridPhone from "../components/VehiclesGridPhone";


export default function OnsiteVehicles() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState(null);
  const [isPlateVisible, setIsPlateVisible] = useState(true);
  const [isGridVisible, setIsGridVisible] = useState(false);
  const [sortColumn, setSortColumn] = useState("plate");
  const [sortDirection, setSortDirection] = useState("asc");

  const [showCards, setShowCards] = useState(true);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    if (hoaId) {
      const fetchOnsiteVehicles = async () => {
        try {
          setVehiclesLoading(true);
          const response = await axios.get(`/vehicles/${hoaId}`);
          let newary = [];
          response.data.forEach(element => {
            if (getVehicleActiveStatusBoolean(element)) {
              newary.push(element);
            }
          });
          const sorted = [...newary].sort((a, b) => {
            let valueA, valueB;
            valueA = (a.plate || "").toLowerCase();
            valueB = (b.plate || "").toLowerCase();
            return valueA.localeCompare(valueB);
          });
          setVehicles(sorted);
          setVehiclesError(null);
        } catch (err) {
          setVehiclesError(err.message || "Failed to load vehicles");
          console.error("Error fetching vehicles:", err);
        } finally {
          setVehiclesLoading(false);
        }
      };
      fetchOnsiteVehicles();
    }
  }, [hoaId]);


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

  const handleBackToDashboard = () => {
    navigate(`/${hoaId}/dashboard`);
  };

  const navButtons = [
    {
      label: "Back",
      onClick: handleBackToDashboard,
      which: "goback"
    }
  ];
  let backgroundImage = '';
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
  }

  const renderVehiclePlate = (vehicle) => {
    return (<div className="grid-container-2-plate"
      key={vehicle._id}>
      <div className="full-row" style={{
        fontWeight: "bold", fontSize: "24px", color: "#1976d2",
        borderBottom: "2px solid #1976d2", padding: "5px",
        marginBottom: "10px"
      }}>

        {vehicle.plate} {vehicle.plate_state && `(${vehicle.plate_state})`}
      </div>
      {/* <div className="grid-item-bold">Name</div>
      <div className="grid-item-normal"> {vehicle.carowner_lname || "N/A"}, {vehicle.carowner_fname || "N/A"}</div> */}
      <div className="grid-item-bold">User</div>
      <div className="grid-item-bold">Checkout</div>

      <div className="grid-item-normal"> {vehicle.carownertype || "N/A"} </div>
      {/* <div className="grid-item-bold">Make</div>
      <div className="grid-item-normal">{vehicle.make}, {vehicle.model}</div> */}
      {getVehicleIsActiveTodayBoolean(vehicle) ? (
        <div className="grid-item-normal-highlight">
          {utcDateOnly(vehicle.checkout)}
        </div>
      ) : (
        <div className="grid-item-normal"> {utcDateOnly(vehicle.checkout)}</div>
      )}
    </div>)
  }
  const renderVehicleCard = (vehicle) => {
    return (
      <div className="grid-container-3_oldhoa" key={vehicle._id}>

        <div className="full-row" style={{
          fontWeight: "bold", fontSize: "24px", color: "#1976d2",
          borderBottom: "2px solid #1976d2", padding: "5px",
          marginBottom: "10px"
        }}>
          {vehicle.plate + (vehicle.plate_state ? ` (${vehicle.plate_state})` : "")}
        </div>

        <div className="full-row" style={{ marginBottom: '5px' }}>{vehicle.carowner_lname || "N/A"}, {vehicle.carowner_fname || "N/A"}

        </div>

        <div className="full-row" style={{ fontSize: '.9rem', marginBottom: '5px' }}>{formatPhoneNumber(vehicle.carownerphone) || "N/A"}</div>

        <div className="grid-item-bold">Unit</div>
        <div className="grid-item-bold">&nbsp;</div>
        <div className="grid-item-bold">Type</div>

        <div className="grid-item-normal">{vehicle.unitnumber || "N/A"}</div>
        <div className="grid-item-bold">{vehicle.carownertype.toUpperCase()}</div>
        <div className="grid-item-normal">{vehicle.vehicle_type || "N/A"}</div>

        <div className="grid-item-bold">Make</div>
        <div className="grid-item-bold">Model</div>
        <div className="grid-item-bold">Year</div>

        <div className="grid-item-normal">{vehicle.make || "N/A"}</div>
        <div className="grid-item-normal">{vehicle.model || "N/A"}</div>
        <div className="grid-item-normal">{vehicle.year || "N/A"}</div>

        <div className="grid-item-bold">Check In</div>
        <div className="grid-item-bold">Check Out</div>
        <div className="grid-item-bold">Active</div>
        <div className="grid-item-normal">{utcDateOnly(vehicle.checkin)}</div>
        <div className="grid-item-normal">{utcDateOnly(vehicle.checkout)}</div>
        <div className="grid-item-normal"><b>{getVehicleActiveStatusBoolean(vehicle) ? "Yes" : "No"} </b></div>




        <div className="grid-item-bold">Payment</div>
        <div className="grid-item-bold" style={{ backgroundColor: "#ffffff" }}>
          {vehicle.requires_payment == 1 ? (
            "Pay Now"
          ) : vehicle.requires_payment == 2 ? (<b>Paid</b>) : (<b>Free</b>)}
        </div>
      </div>
    )
  }


 const handleShowTable = () => {
    if (showTable) {
      setShowTable(false)
    } else {
      setShowTable(true)

    }
  };



  const handleShowPlate = () => {
    if (isPlateVisible) {
      setIsPlateVisible(false)
    } else {
      setIsPlateVisible(true)

    }
  };

  const handleShowGrid = () => {
    if (isGridVisible) {
      setIsGridVisible(false)
    } else {
      setIsGridVisible(true)

    }
  };


  let role = "owner";

  let bgcolor = 'white';
  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#f5f5f5",
      backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover",
      backgroundPosition: "center", backgroundAttachment: "fixed"
    }}>

      <DashboardNavbar title="Onsite Vehicles" title2={hoa && hoa.name} buttons={navButtons} />
      <div className="page-content">

        <div className="standardtitlebar">
          <h2>Onsite Vehicles</h2>
          <div style={{ marginTop: '5px' }}>

            <button className="navbutton2" onClick={handleShowTable}>
              {showTable ? "Hide Table" : "Show Table"}
            </button>

            <button className="navbutton2" onClick={handleShowPlate}
            disabled = {showTable}>
              {isPlateVisible ? "Show Cards" : "Show Plates"}
            </button>

            <button className="navbutton2" onClick={handleShowGrid}>
              {isGridVisible ? "Hide Violations" : "Show Violations"}
            </button>

          </div>
        </div>

        {!showTable && (
           <div className="standardtitlebar">
          <div style={{ marginBottom: "10px" }}><b>Sort Order</b></div>
          <div className="button-grid">
            <button className="btns btn-primary"
              onClick={() => handleSort("owner")}>
              Owner
            </button>
            <button className="btns btn-primary"
              onClick={() => handleSort("plate")}>
              Plate
            </button>
            <button className="btns btn-primary  "
              onClick={() => handleSort("enddate")}>
              Checkout
            </button>
            <button className="btns btn-primary"
              onClick={() => handleSort("active")}>
              Active
            </button>
          </div>
        </div>
        )}

       

        {vehiclesError && (
          <div className="displayerror">
            Error: {vehiclesError}
          </div>
        )}

        {vehiclesLoading && (
          <div className="ajaxloading">
            Loading vehicles...
          </div>
        )}

        {!vehiclesLoading && vehicles.length === 0 && (
          <div className="displayerror">
            No onsite vehicles found
          </div>
        )}

        {isGridVisible ? (
          <div className="onsite-grid-container-2">
            <div className='grid-flex-container'>
              {showTable ? (
                <VehiclesTableOnsite
                  vehicles={vehicles}
                  role={role}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  handleSort={handleSort}
                  getVehicleActiveStatusBoolean={getVehicleActiveStatusBoolean}
                  utcDateOnly={utcDateOnly}
                />

              ) : (
                
                  vehicles.map((vehicle, index) => (
                    isPlateVisible ? renderVehiclePlate(vehicle) :
                      renderVehicleCard(vehicle)
                  ))
              )}
            </div>
            <div className="flex-container">
              <div className="header-title">Violations</div>
              <ViolationsAccordion hoaId={hoaId} />
            </div>
          </div>

        ) : (
          <>
            <div className='grid-flex-container'>
             {showTable ? (
                <VehiclesTableOnsite
                  vehicles={vehicles}
                  role={role}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  handleSort={handleSort}
                  getVehicleActiveStatusBoolean={getVehicleActiveStatusBoolean}
                  utcDateOnly={utcDateOnly}
                />

              ) : (
                
                  vehicles.map((vehicle, index) => (
                    isPlateVisible ? renderVehiclePlate(vehicle) :
                      renderVehicleCard(vehicle)
                  ))
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}
