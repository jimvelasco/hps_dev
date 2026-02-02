import React from "react";
import TableButton from "./TableButton";
import { formatPhoneNumber } from "../utils/vehicleHelpers";

export default function VehiclesGridPhone({ vehicles, role, sortColumn, sortDirection, handleSort, handleDetailsClick, handlePaymentClick, getVehicleActiveStatusBoolean, utcDateOnly }) {
  // console.log('role in VehiclesGrid:', role);
  return (

    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      justifyContent: 'center'
    }}>
      {vehicles.map((vehicle, index) => (
        <div className="grid-container-3_oldhoa" key={vehicle._id}>
          <div className="full-row">
            <div className="button-grid" style={{ marginBottom: '10px' }}>

              <button className="btns btn-primary"
                onClick={() => handleDetailsClick(vehicle)}>
                {vehicle.plate + (vehicle.plate_state ? ` (${vehicle.plate_state})` : "")}
              </button>
            </div>
          </div>
          {}
          {/* <div className="full-row"><b>Name</b></div> */}
          <div className="full-row" style={{ marginBottom: '5px' }}>{vehicle.carowner_lname || "N/A"}, {vehicle.carowner_fname || "N/A"}
           
          </div>
          
          <div className="full-row" style={{fontSize:'.9rem',marginBottom:'5px'}}>{formatPhoneNumber(vehicle.carownerphone) || "N/A"}</div>

          <div className="grid-item-bold">Unit</div>
          <div className="grid-item-bold"><span style={{ textDecoration:"xunderline",color:"xwhite",backgroundColor:"##ccc",padding:"10px"}}>{vehicle.carownertype.toUpperCase()}</span></div>
          <div className="grid-item-bold">Type</div>

          <div className="grid-item-normal">{vehicle.unitnumber || "N/A"}</div>
          <div className="grid-item-normal">&nbsp;</div>
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
          <div className="grid-item-normal">
            {vehicle.requires_payment == 1 ? (
              <div className="xbutton-grid">
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
          {/* <div><b>{vehicle.carownertype}</b></div> */}
        </div>
      ))}
    </div>


  );
}

/*
 <div className="standard-table-cell"> {vehicle.requires_payment} 
              {vehicle.requires_payment == 1 ? "B" : getVehicleActiveStatusBoolean(vehicle) ? "Yes" : "No"}
            </div>


              {vehicle.requires_payment == 1 ? "Button" : getVehicleActiveStatusBoolean(vehicle) ? "Yes" : "No"}
*/
