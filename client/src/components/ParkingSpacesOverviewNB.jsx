import React, { useEffect, useState } from "react";
import { useHoa } from "../context/HoaContext";
import { useParams } from "react-router-dom";
import axios from "../services/api";

export default function ParkingSpacesOverviewNB() {
  const { hoa } = useHoa();
  const { hoaId } = useParams();
  const [occupiedSpaces, setOccupiedSpaces] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!hoaId) return;
      
      try {
        setLoading(true);
       // console.log("PSOFetching vehicles for HOA ID:", hoaId);
        const response = await axios.get(`/vehicles/${hoaId}`);
        const vehicles = response.data;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const occupied = vehicles.filter(vehicle => {
          if (!vehicle.enddate) return false;
          const endDate = new Date(vehicle.enddate);
          endDate.setHours(0, 0, 0, 0);
          return endDate >= today;
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
    <div className="parking-spaces-overview2">
      {/* <h2 className="parking-overview-title">Parking Spaces</h2> */}
      
      {loading ? (
        <div className="parking-overview-loading">
          Loading...
        </div>
      ) : (
        <span style={{color: "#bbb", backgroundColor: "#333"}}>
            <span>Total <b style={{color: "#fff"}}>{totalSpaces}</b></span>&nbsp;,&nbsp;

            <span>Occupied  <b style={{color: "#fff"}}>{occupiedSpaces}</b></span>&nbsp;,&nbsp;

            <span >Remaining  <b style={{color: "#fff"}}>{remainingSpaces}</b></span>
        </span>
      )}
    </div>
  );
}
