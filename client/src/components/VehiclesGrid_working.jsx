import React from "react";
import TableButton from "./TableButton";

export default function VehiclesGrid({ vehicles, role, sortColumn, sortDirection, handleSort, handleDetailsClick, handlePaymentClick,getVehicleActiveStatusBoolean }) {
  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      overflow: "hidden"
    }}>
     
      
      <div className="vehicles-table">
        
        <div className="standard-table-header" style={{ cursor: "pointer" }} onClick={() => handleSort("owner")}>
          <span style={{ textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            Owner Name {sortColumn === "owner" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
          </span>
        </div>
         <div className="standard-table-header ">Type</div>
        <div className="standard-table-header ">Vehicle</div>
        <div className="standard-table-header ">Make</div>
         <div className="standard-table-header ">Model</div>
        <div className="standard-table-header" style={{ cursor: "pointer" }} onClick={() => handleSort("plate")}>
          <span style={{ textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            Plate {sortColumn === "plate" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
          </span>
        </div>
        <div className="standard-table-header " style={{ cursor: "pointer" }} onClick={() => handleSort("enddate")}>
          <span style={{ textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            Check Out {sortColumn === "enddate" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
          </span>
        </div>
        <div className="standard-table-header" style={{ cursor: "pointer" }} onClick={() => handleSort("active")}>
          <span style={{ textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            Active {sortColumn === "active" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
          </span>
        </div>

        {vehicles.map((vehicle, index) => (
          <div key={vehicle._id || index} className="standard-table-row">
            <div className="standard-table-cell">
              {vehicle.carowner_lname}, {vehicle.carowner_fname}
            </div>
             <div className="standard-table-cell "> {vehicle.carownertype} {vehicle.unitnumber}</div>
            <div className="standard-table-cell ">{vehicle.vehicle_type}</div>
            <div className="standard-table-cell ">{vehicle.make}</div>
            <div className="standard-table-cell ">{vehicle.model}</div>
            {/* <div className="standard-table-cell ">{vehicle.model || "N/A"}</div> */}
            <div className="standard-table-cell"><TableButton
                label={vehicle.plate + (vehicle.plate_state ? ` (${vehicle.plate_state})` : "")}
                onClick={() => handleDetailsClick(vehicle._id)}
                className="table-button"
              />
            </div>
            <div className="standard-table-cell ">{vehicle.enddate}</div>
            
            {role === "renter" ? (
              <div className="standard-table-cell"> 
               {vehicle.requires_payment == 1 ? (
                <TableButton
                label={"Pay Now"}
                onClick={() => handlePaymentClick(vehicle._id)}
                className="table-button-payment"
              />
                ) : "Free"}
               </div>
            ) : (
              <div className="standard-table-cell"> 
               {getVehicleActiveStatusBoolean(vehicle) ? "Yes" : "No"}
               </div>

            )}
            
          </div>
        ))}
      </div>
    </div>
  );
}

/*
 <div className="standard-table-cell"> {vehicle.requires_payment} 
              {vehicle.requires_payment == 1 ? "B" : getVehicleActiveStatusBoolean(vehicle) ? "Yes" : "No"}
            </div>


              {vehicle.requires_payment == 1 ? "Button" : getVehicleActiveStatusBoolean(vehicle) ? "Yes" : "No"}
*/
