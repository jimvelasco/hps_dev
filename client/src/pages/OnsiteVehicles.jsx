import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../services/api";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import DashboardNavbar from "../components/DashboardNavbar";
import { getVehicleActiveStatusBoolean, getVehicleIsActiveTodayBoolean, formatPhoneNumber, utcDateOnly } from "../utils/vehicleHelpers";
import TableButton from "../components/TableButton";
import ViolationsAccordion from "../components/ViolationsAccordion";


export default function OnsiteVehicles() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState(null);
  const [isPlateVisible, setIsPlateVisible] = useState(false);
  const [isGridVisible, setIsGridVisible] = useState(false);

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
    backgroundImage = hoa.background_image_url;
  }

  const renderVehiclePlate = (vehicle) => {
    return (<div className="grid-container-2-plate"
      key={vehicle._id}>
      <div className="full-row">
        <h4 style={{
          margin: "5px", color: "#1976d2", borderBottom: "2px solid #1976d2", padding: "5px"
        }}>
          {vehicle.plate} {vehicle.plate_state && `(${vehicle.plate_state})`}
        </h4>
      </div>
      <div className="grid-item-bold">Name</div>
      <div className="grid-item-normal"> {vehicle.carowner_lname || "N/A"}, {vehicle.carowner_fname || "N/A"}</div>
      <div className="grid-item-bold">User</div>
      <div className="grid-item-normal"> {vehicle.carownertype || "N/A"} </div>
      <div className="grid-item-bold">Make</div>
      <div className="grid-item-normal">{vehicle.make}, {vehicle.model}</div>
      <div className="grid-item-bold">Checkout</div>
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
    return (<div className="grid-container-2"
      key={vehicle._id}>

      <div className="full-row">
        <h4 style={{
          margin: "5px", color: "#1976d2", borderBottom: "2px solid #1976d2", padding: "5px"
        }}>
          {vehicle.plate} {vehicle.plate_state && `(${vehicle.plate_state})`}
        </h4>
      </div>

      <div className="grid-item-bold">Name</div>
      <div className="grid-item-normal"> {vehicle.carowner_lname || "N/A"}, {vehicle.carowner_fname || "N/A"}</div>

      <div className="grid-item-bold">User</div>
      <div className="grid-item-normal"> {vehicle.carownertype || "N/A"} </div>

      <div className="grid-item-bold">Unit </div>
      <div className="grid-item-normal">{vehicle.unitnumber || "N/A"}</div>

      <div className="grid-item-bold">Phone</div>
      <div className="grid-item-normal"> {formatPhoneNumber(vehicle.carownerphone) || "N/A"}</div>


      <div className="grid-item-bold">Make</div>
      <div className="grid-item-normal">{vehicle.make}, {vehicle.model}</div>

      <div className="grid-item-bold">Checkin</div>
      <div className="grid-item-normal"> {utcDateOnly(vehicle.checkin)}</div>

      <div className="grid-item-bold">Checkout</div>
      {getVehicleIsActiveTodayBoolean(vehicle) ? (
        <div className="grid-item-normal-highlight">
          {utcDateOnly(vehicle.checkout)}
        </div>
      ) : (
        <div className="grid-item-normal"> {utcDateOnly(vehicle.checkout)}</div>
      )}

      <div className="grid-item-bold">Payment</div>
      <div className="grid-item-normal" > {vehicle.requires_payment == 1 ? (
        <b>Pay Now</b>
      ) : vehicle.requires_payment == 2 ? (<b>Paid</b>) : (<b>Free</b>)}
      </div>
    </div>)
  }
 

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




  let bgcolor = 'white';
  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#f5f5f5",
      backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover",
      backgroundPosition: "center", backgroundAttachment: "fixed"
    }}>

      <DashboardNavbar title={`Onsite Vehicles - ${hoa?.name || "HOA"}`} buttons={navButtons} />
      <div className="page-content">

        <div className="standardtitlebar">
          <h1 style={{ fontSize: "24px" }}>Onsite Vehicles</h1>
          <div style={{ marginTop: '5px' }}>

            <button className="navbutton2" onClick={handleShowPlate}>
              {isPlateVisible ? "Show Cards" : "Show Plates"}
            </button>

            <button className="navbutton2" onClick={handleShowGrid}>
              {isGridVisible ? "Hide Violations" : "Show Violations"}
            </button>

          </div>
        </div>

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
              {vehicles.map((vehicle, index) => (
                isPlateVisible  ? renderVehiclePlate(vehicle) :
                  renderVehicleCard(vehicle)
              ))}
            </div>
            <div className="flex-container">

              <div className="header-title">Violations</div>
              <ViolationsAccordion hoaId={hoaId} />
            </div>
          </div>

        ) : (
          <div className='grid-flex-container'>
            {vehicles.map((vehicle, index) => (
              isPlateVisible  ? renderVehiclePlate(vehicle) :
                renderVehicleCard(vehicle)
            ))}
          </div>
        )
        }

      </div>

    </div>
  );
}
