import React from "react";
import TableButton from "./TableButton";
import { formatPhoneNumber } from "../utils/vehicleHelpers";

export default function VehiclesGridPhone({ vehicles, role, sortColumn, sortDirection, handleSort, handleDetailsClick, handlePaymentClick, getVehicleActiveStatusBoolean, utcDateOnly }) {
  //  console.log('role in VehiclesGrid:', role);
  return (
    <div>
      {/* {role !== "renter" ? (
        <div className="standardtitlebar">
          <div><b>Sort Order</b></div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
            marginBottom: '0px'
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
          </div>
        </div>
      ) : null} */}

      {/* {role !== "renter" ? (
        <div className="standardtitlebar">
          <div><b>Sort Order</b></div>
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
      ) : null} */}







      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        justifyContent: 'center'
      }}>
        {vehicles.map((vehicle, index) => (
          <div className="grid-container-3_oldhoa" key={vehicle._id}>
            <div className="full-row">
              <div className="button-grid" style={{ marginBottom: '8px' }}>

                <button className="btns btn-primary"
                  onClick={() => handleDetailsClick(vehicle)}>
                  {vehicle.plate + (vehicle.plate_state ? ` (${vehicle.plate_state})` : "")}
                </button>
              </div>
            </div>
            <div className="full-row"><b>Name</b></div>
            <div className="full-row">{vehicle.carowner_lname || "N/A"}, {vehicle.carowner_fname || "N/A"}</div>

            <div className="grid-item-bold">Phone</div>
            <div className="grid-item-bold">Unit</div>
            <div className="grid-item-bold">Owner</div>

            <div className="grid-item-normal">{formatPhoneNumber(vehicle.carownerphone) || "N/A"}</div>
            <div className="grid-item-normal">{vehicle.unitnumber || "N/A"}</div>
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
            <div className="grid-item-normal">{getVehicleActiveStatusBoolean(vehicle) ? "Yes" : "No"}</div>

            <div className="grid-item-bold">Payment</div>
            <div className="grid-item-normal">
              {vehicle.requires_payment == 1 ? (
                <div className="button-grid">
                  <button className="btns btn-primary"
                    onClick={() => handlePaymentClick(vehicle)}>
                    Pay Now
                  </button>
                </div>
              ) : vehicle.requires_payment == 2 ? (<b>Paid</b>) : (<b>Free</b>)}
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
