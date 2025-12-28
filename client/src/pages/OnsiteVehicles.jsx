import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../services/api";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import DashboardNavbar from "../components/DashboardNavbar";
import { getVehicleActiveStatusBoolean, getVehicleIsActiveTodayBoolean, formatPhoneNumber } from "../utils/vehicleHelpers";


export default function OnsiteVehicles() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState(null);

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
         
          setVehicles(newary);
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

  const formatDate = (date, vehicle) => {
   
    let newdate = date;
   
    return newdate;
  };
  const paymentRequired = (vehicle) => {
    if (vehicle.requires_payment == 1) {
      return true;
    } else {
      return false;
    }
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
          <h1 style={{ fontSize: "24px" }}>Onsite Vehicles</h1>
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

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "15px"
        }}>

          {vehicles.map((vehicle) => (
            <div className="standardcard"
              key={vehicle._id}
              style={{ backgroundColor: paymentRequired(vehicle) ? '#white' : 'white' }}
            >
              <div style={{ marginBottom: "10px", padding: "10px", borderBottom: "0px solid #1976d2" ,
               backgroundColor: paymentRequired(vehicle) ? 'lightblue' : 'white'

              }}>
                <h4 style={{ margin: "0 0 5px 0", color: "#1976d2"
                 
                  }}>                  
                  {vehicle.plate} {vehicle.plate_state && `(${vehicle.plate_state})`}
                </h4>
              </div>

              <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
                <div><b>Unit:</b> {vehicle.unitnumber || "N/A"}</div>
                <div><b>Type:</b> {vehicle.carownertype || "N/A"} </div>
                <div><b>Phone:</b> {formatPhoneNumber(vehicle.carownerphone) || "N/A"}</div>
                <div><b>Checkin:</b> {formatDate(vehicle.startdate, vehicle)}</div>
                <div
                  style={{
                    backgroundColor: getVehicleIsActiveTodayBoolean(vehicle) ? 'pink' : bgcolor
                  }}
                ><b>Checkout:</b> {formatDate(vehicle.enddate, vehicle)}</div>
                 </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
