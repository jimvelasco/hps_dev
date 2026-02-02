import React from "react";
import TableButton from "./TableButton";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

export default function VehiclesGridOnsite({ vehicles, role, sortColumn, sortDirection, handleSort, handleDetailsClick, handlePaymentClick, getVehicleActiveStatusBoolean, utcDateOnly }) {
    //  console.log('role in VehiclesGrid:', role);
    return (
        <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            overflow: "hidden"
        }}>
            <div className="vehicles-table-owner8">
                <>
                    <div className="standard-table-header" style={{
                        textDecoration: "underline",
                        cursor: "pointer"
                    }} onClick={() => handleSort("owner")}>
                        Owner Name
                        {sortColumn === "owner" && (
                            <FontAwesomeIcon
                                icon={faArrowUp}
                                style={{ transform: sortDirection === "desc" ? "rotate(180deg)" : "none" }}
                            />
                        )}
                    </div>
                    <div className="standard-table-header ">Type</div>
                    <div className="standard-table-header ">Vehicle</div>
                    <div className="standard-table-header ">Make</div>
                    <div className="standard-table-header ">Model</div>
                    <div className="standard-table-header" style={{
                        textDecoration: "underline",
                        cursor: "pointer"
                    }} onClick={() => handleSort("plate")}>
                        Plate
                        {sortColumn === "plate" && (
                            <FontAwesomeIcon
                                icon={faArrowUp}
                                style={{ transform: sortDirection === "desc" ? "rotate(180deg)" : "none" }}
                            />
                        )}
                    </div>
                    <div className="standard-table-header" style={{
                        textDecoration: "underline",
                        cursor: "pointer"
                    }} onClick={() => handleSort("enddate")}>
                        Check Out
                        {sortColumn === "enddate" && (
                            <FontAwesomeIcon
                                icon={faArrowUp}
                                style={{ transform: sortDirection === "desc" ? "rotate(180deg)" : "none" }}
                            />
                        )}
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
                        <div className="standard-table-cell ">{vehicle.model} </div>
                        <div className="standard-table-cell">{vehicle.plate + (vehicle.plate_state ? ` (${vehicle.plate_state})` : "")}</div>
                        <div className="standard-table-cell ">{utcDateOnly(vehicle.checkout)}</div>
                        <div className="standard-table-cell">
                            {vehicle.requires_payment == 1 ? (
                                <b>Pay Now</b>
                            ) : vehicle.requires_payment == 2 ? (<b>Paid</b>) : (<b>Free</b>)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
