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
              <button className="btns btn-secondary"
                onClick={() => handleDetailsClick(vehicle)}>
                {vehicle.plate + (vehicle.plate_state ? ` (${vehicle.plate_state})` : "")}
              </button>
            </div>
          </div>

          
            <div className="full-row" style={{ marginBottom: '0px' }}>{ vehicle.carownertype.toUpperCase()}</div>
          <div className="full-row" style={{ marginBottom: '10px' }}>{vehicle.carowner_lname || "N/A"}, {vehicle.carowner_fname || "N/A"}
           
          </div>
          
         

          <div className="grid-item-bold">Unit</div>
                     {/* <div className="grid-item-bold" style={{marginTop:"15px"}}>{vehicle.carownertype ? 
                     vehicle.carownertype.charAt(0).toUpperCase() + vehicle.carownertype.slice(1) : ""}
                     </div> */}

           <div className="grid-item-bold" style={{marginTop:"0px"}}>Phone</div>
           
          <div className="grid-item-bold">Type</div>

          <div className="grid-item-normal row-with-gap">{vehicle.unitnumber || "N/A"}</div>
          {/* <div className="grid-item-normal row-with-gap" >cbt {vehicle.createdbytype} */}
           <div className="grid-item-normal row-with-gap" style={{marginTop:"0px"}}>
            {vehicle.carownerphone ? vehicle.carownerphone  : ""}
            </div>
          <div className="grid-item-normal row-with-gap">{vehicle.vehicle_type || "N/A"}</div>

          <div className="grid-item-bold">Make</div>
          <div className="grid-item-bold">Model</div>
          <div className="grid-item-bold">Year</div>

          <div className="grid-item-normal row-with-gap">{vehicle.make || "N/A"}</div>
          <div className="grid-item-normal row-with-gap">{vehicle.model || "N/A"}</div>
          <div className="grid-item-normal row-with-gap">{vehicle.year || "N/A"}</div>
   
          <div className="grid-item-bold">Check In</div>
          <div className="grid-item-bold">Check Out</div>
          <div className="grid-item-bold">Color</div>

        

          
          <div className="grid-item-normal row-with-gap">{utcDateOnly(vehicle.checkin)}</div>
          <div className="grid-item-normal row-with-gap">{utcDateOnly(vehicle.checkout)}</div>
           <div className="grid-item-normal row-with-gap">{vehicle.color}</div>
        




          <div className="grid-item-bold">Payment</div>
          <div className="grid-item-normal">
            {vehicle.requires_payment == 1 ? (
              <div className="xbutton-grid">
                <button className="btnxs btn-primary" style={{width:"80%"}}
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
            <div className="grid-item-normal " >
         
            {getVehicleActiveStatusBoolean(vehicle) ? (
               <div style={{backgroundColor:"#16A34A",color:"white",padding:"3px",display:"inline-block"}}>Active</div> ) : 
              ("Not Active")
              } 
            </div>
          {/* <div><b>{vehicle.carownertype}</b></div> */}
           <div className="full-row vehicle-pin-action-row">
            
             {/*{vehicle.pin_code_action === "standard" ? "" : vehicle.pin_code_action?.toUpperCase()} */}
             {/* {(vehicle.pin_code_action === "contractor" || vehicle.pin_code_action === "visitor"  || vehicle.pin_code_action === "dayuse") && "(Day Use Only)"} */}
           {(vehicle.day_use_only === 1) && "DAY USE"}
           </div>
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
