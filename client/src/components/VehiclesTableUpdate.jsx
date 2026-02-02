import React from "react";
import TableButton from "./TableButton";

export default function VehiclesTableUpdate({ vehicles, role, sortColumn, sortDirection, handleSort, handleDetailsClick, handlePaymentClick, getVehicleActiveStatusBoolean,utcDateOnly }) {
//  console.log('role in VehiclesGrid:', role);
let flag = 'update';
  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      overflow: "hidden"
    }}>

      <div className="vehicles-table-owner">
          <>
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
            <div className="standard-table-header " style={{ cursor: "pointer" }} onClick={() => handleSort("active")}>
              <span style={{ textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                Active {sortColumn === "active" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </span>
            </div>
          
            
            <div className="standard-table-header ">Payment</div>
          </>
       
        {vehicles.map((vehicle, index) => (
          <div key={vehicle._id || index} className="standard-table-row">
            <div className="standard-table-cell">
              {vehicle.carowner_lname}, {vehicle.carowner_fname}
            </div>
            <div className="standard-table-cell "> {vehicle.carownertype}</div>
            <div className="standard-table-cell ">{vehicle.vehicle_type}</div>
            <div className="standard-table-cell ">{vehicle.make}</div>
            <div className="standard-table-cell ">{vehicle.model}</div>

             <div  style={{ marginTop: '5px' }}>
              <button className="btnxs btn-primary"
                onClick={() => handleDetailsClick(vehicle)}>
                {vehicle.plate + (vehicle.plate_state ? ` (${vehicle.plate_state})` : "")}
              </button>
            </div>

            {/* <div className="standard-table-cell">{vehicle.plate + (vehicle.plate_state ? ` (${vehicle.plate_state})` : "")}</div> */}

            <div className="standard-table-cell ">{utcDateOnly(vehicle.checkout) }</div>
            <div className="standard-table-cell ">
              {getVehicleActiveStatusBoolean(vehicle) ? "Yes" : "No"}
            </div>

              {/* <div className="standard-table-cell">
                {vehicle.requires_payment == 1 ? (
                  <b>Pay Now</b>
                ) : vehicle.requires_payment == 2 ? (<b>Paid</b>) : (<b>Free</b>)}
              </div> */}

               {vehicle.requires_payment == 1 ? (
              <div className="xbutton-grid" style={{marginTop:"5px"}}>
                <button className="btnxs btn-primary"
                  onClick={() => handlePaymentClick(vehicle)}>
                  Pay Now
                </button>
              </div>
            ) : vehicle.requires_payment == 2 ? (
              <div className="grid-item-bold">Paid</div>
            ) : (
              <div className="grid-item-bold">Free</div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
