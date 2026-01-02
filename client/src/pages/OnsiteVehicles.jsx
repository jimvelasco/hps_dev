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
    const [showPlate, setShowPlate] = useState('cards');
    const [showGrid, setShowGrid] = useState(false);
    const [vehiclesLoading, setVehiclesLoading] = useState(true);
    const [vehiclesError, setVehiclesError] = useState(null);
     const [violations, setViolations] = useState([]);

    useEffect(() => {
        if (hoaId) {
            const fetchOnsiteVehicles = async () => {
                //  console.log("Fetching onsite vehicles for HOA ID:", hoaId);
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
            fetchViolations();
        }
    }, [hoaId]);

     const fetchViolations = () => {
    const mockViolations = [
      {
        title: "ABC 1234 MO",
        details: [
          { label: "License Plate:", value: "ABC 1234" },
          { label: "State:", value: "CO" },
          { label: "Location:", value: "Lot B, Space 15" },
          { label: "Type:", value: "Improper Parking" },
          { label: "Date:", value: "2024-01-15" },
          { label: "Time:", value: "14:30" },
          { label: "Reporter:", value: "Security" },
          {
            label: "Description:",
            value: "Vehicle parked across two spaces",
          },
        ],
      },
      {
        title: "XYZ 5678 TX",
        details: [
          { label: "License Plate:", value: "XYZ 5678" },
          { label: "State:", value: "CO" },
          { label: "Location:", value: "Lot A, Space 8" },
          { label: "Type:", value: "Fire Hydrant Blocking" },
          { label: "Date:", value: "2024-01-14" },
          { label: "Time:", value: "10:15" },
          { label: "Reporter:", value: "Management" },
          { label: "Description:", value: "Vehicle blocking fire hydrant" },
        ],
      },
      {
        title: "DEF 9012 CO",
        details: [
          { label: "License Plate:", value: "DEF 9012" },
          { label: "State:", value: "WY" },
          { label: "Location:", value: "Lot C, Space 22" },
          { label: "Type:", value: "Unregistered Vehicle" },
          { label: "Date:", value: "2024-01-13" },
          { label: "Time:", value: "22:45" },
          { label: "Reporter:", value: "Resident" },
          {
            label: "Description:",
            value: "Guest vehicle parked without registration",
          },
        ],
      },
    ];
    setViolations(mockViolations);
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
        backgroundImage = hoa.background_image_url;
    }

    const renderVehiclePlate = (vehicle) => {
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
                    <h1 style={{ fontSize: "24px" }}>Onsite Vehicles 2</h1>
                    <div style={{ marginTop: '5px' }}>
                        <button className="navbutton" onClick={() => setShowPlate('cards')}>Cards</button>&nbsp;
                        <button className="navbutton" onClick={() => setShowPlate('plates')}>Plates</button>&nbsp;
                         <button className="navbutton" onClick={() => setShowGrid(true)}>Show</button>&nbsp;
                        <button className="navbutton" onClick={() => setShowGrid(false)}>Hide</button>
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

                {showGrid ? (
                    <div className="onsite-grid-container-2">
                        <div className='grid-flex-container'>
                            {vehicles.map((vehicle, index) => (
                                showPlate === 'cards' ? renderVehicleCard(vehicle) :
                                    renderVehiclePlate(vehicle)
                            ))}
                        </div>
                        <div> {violations.length > 0 ? (
                                    <ViolationsAccordion items={violations} />
                                  ) : (
                                    <p>No violations found.</p>
                                  )}</div>
                    </div>

                ) : (
                    <div className='grid-flex-container'>
                        {vehicles.map((vehicle, index) => (
                            showPlate === 'cards' ? renderVehicleCard(vehicle) :
                                renderVehiclePlate(vehicle) 
                        ))}
                    </div>
                )
                }

            </div>

        </div>
    );
}
