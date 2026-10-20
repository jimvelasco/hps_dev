import React, { useEffect, useState } from "react";
import { useHoa } from "../context/HoaContext";
import { useParams } from "react-router-dom";
import axios from "../services/api";
import {getVehicleActiveStatusBoolean} from "../utils/vehicleHelpers";


export default function ParkingSpacesOverview() {
  const { hoa } = useHoa();
  const { hoaId } = useParams();
  const [occupiedSpaces, setOccupiedSpaces] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!hoaId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`/vehicles/${hoaId}`);
        const vehicles = response.data;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const occupied = vehicles.filter(vehicle => {
          if (!vehicle.enddate) return false;
           return getVehicleActiveStatusBoolean(vehicle);
        }).length;
        
        setOccupiedSpaces(occupied);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, [hoaId]);

  const totalSpaces = hoa?.parking_allowed_hoa || 0;
  const remainingSpaces = totalSpaces - occupiedSpaces;

  return (
    <div className="parking-spaces-overview">
      {/* <h2 className="parking-overview-title">Parking Spaces</h2> */}
      
      {loading ? (
        <div className="parking-overview-loading">
          Loading...
        </div>
      ) : (
        <>
          <div className="hoainformation2colr"  style={{ textAlign:"left",marginTop:"15px",marginLeft:"15px"}}>
           

            <div><strong>Day Passes Used</strong></div>
            <div>{occupiedSpaces}</div>

            <div><strong>Remaining Passes</strong></div>
            <div>{1}</div>
            </div>
        </>
      )}
    </div>
  );
}
