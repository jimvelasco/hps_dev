import React from "react";
import NavButton from "./NavButton";
import ParkingSpacesOverviewNB from "./ParkingSpacesOverviewNB";


export default function DashboardNavbar({ title, buttons }) {
  let role = null;
  let roletitle = "Administrator";
 // const loggedInUserString = localStorage.getItem("loggedInUser");

  return (
    <nav className="navbar">
      <div>
        <h2 style={{ color: "white", margin: 0 }}>{title}</h2>
       
          <div style={{ color: "#bbb", margin: "5px 0 5px 0", fontSize: "12px" }}>
            <ParkingSpacesOverviewNB />
          </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", border: "0px solid white" }}>
        {buttons && buttons.map((button, index) => (
          <div key={index}>
            <NavButton
              label={button.label}
              onClick={button.onClick}
              className="navbutton"
              which={button.which}
            />
          </div>
        ))}
      </div>

    </nav>
  );
}
