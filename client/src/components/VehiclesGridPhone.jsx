import React from "react";
import TableButton from "./TableButton";

export default function VehiclesGridPhone({ vehicles, role, sortColumn, sortDirection, handleSort, handleDetailsClick, handlePaymentClick, getVehicleActiveStatusBoolean, utcDateOnly }) {
  //  console.log('role in VehiclesGrid:', role);
  return (
    <div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        justifyContent: 'center'
      }}>
        <button className="navbutton wid80"
          onClick={() => handleSort("owner")}>
          Owner
        </button>
        <button className="navbutton wid80"
          onClick={() => handleSort("plate")}>
          Plate
        </button>
        <button className="navbutton wid80  "
          onClick={() => handleSort("enddate")}>
          Checkout
        </button>
        <button className="navbutton wid80"
          onClick={() => handleSort("active")}>
          Active
        </button>
        {/* <div className="standard-table-header" style={{ cursor: "pointer" }} onClick={() => handleSort("owner")}>
          <span style={{ textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            Owner Name {sortColumn === "owner" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
          </span>
        </div>
        

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
        </div> */}

      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        justifyContent: 'center'
      }}>

        {vehicles.map((vehicle, index) => (
          <div className="standardcard"
            key={vehicle._id}
          >
            <div style={{
              marginBottom: "10px", padding: "10px", borderBottom: "0px solid #1976d2"
            }}>
              <h4 style={{
                margin: "0 0 5px 0", color: "#1976d2"
              }}>
                <TableButton
                  label={vehicle.plate + (vehicle.plate_state ? ` (${vehicle.plate_state})` : "")}
                  onClick={() => handleDetailsClick(vehicle._id)}
                  className="table-button"
                />



                {/* {vehicle.plate} {vehicle.plate_state && `(${vehicle.plate_state})`} */}
              </h4>
            </div>

            <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
              <div><b>Name:</b> {vehicle.carowner_lname || "N/A"}, {vehicle.carowner_fname || "N/A"}</div>
              <div><b>Unit:</b> {vehicle.unitnumber || "N/A"}</div>
              <div><b>Type:</b> {vehicle.carownertype || "N/A"} </div>
              <div><b>Phone:</b> {vehicle.carownerphone || "N/A"}</div>
              <div><b>Make:</b> {vehicle.make || "N/A"}</div>
              <div><b>Model:</b> {vehicle.model || "N/A"}</div>
              <div><b>Checkin:</b> {utcDateOnly(vehicle.checkin)}</div>
              <div><b>Checkout:</b> {utcDateOnly(vehicle.checkout)}</div>
              <div><b>Active:</b> {getVehicleActiveStatusBoolean(vehicle) ? "Yes" : "No"}</div>
            </div>
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
