import React from "react";
import NavButton from "./NavButton";
import ParkingSpacesOverviewNB from "./ParkingSpacesOverviewNB";


export default function DashboardNavbar({ title, buttons }) {
  let role = null;
  let roletitle = "Administrator";
  // const loggedInUserString = localStorage.getItem("loggedInUser");
  // <div style={{ color: "#bbb", margin: "5px 0 5px 0", fontSize: "12px" }}>
  return (
    <>
      <div className="tableview">
        <nav style={{ backgroundColor: "#333", padding: "10px" }}>
          <div className="button-grid-nc">
            <h2 style={{ color: "white", marginBottom: "10px" }}>{title}</h2>
            <ParkingSpacesOverviewNB />
          </div>
          <div className="button-grid">

            {buttons && buttons.map((button, index) => (
              <NavButton key={index}
                label={button.label}
                onClick={button.onClick}
                className="navbutton"
                which={button.which}
              />
            ))}
          </div>
        </nav>
      </div>
      <div className="phoneview">
        <nav style={{ backgroundColor: "#333", padding: "10px"  }}>
          <div style={{marginBottom: "0px",  alignItems:"center", justifyContent:"center", display:"flex"}}>
            <h2 style={{ color: "white", marginBottom: "0px" }}>{title}</h2>
          </div>
          <div style={{marginBottom: "10px",  alignItems:"center", justifyContent:"center", display:"flex"}}>
          <ParkingSpacesOverviewNB />
          </div>

          <div className="button-grid">
            {buttons && buttons.map((button, index) => (
              <NavButton key={index}
                label={button.label}
                onClick={button.onClick}
                className="navbutton"
                which={button.which}
              />
            ))}
          </div>
        </nav>
      </div>
    </>

  );
}
