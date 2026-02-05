import React from "react";
import NavButton from "./NavButton";
import ParkingSpacesOverviewNB from "./ParkingSpacesOverviewNB";


export default function DashboardNavbar({ title, title2,buttons }) {
  let role = null;
  let roletitle = "Administrator";
  // const loggedInUserString = localStorage.getItem("loggedInUser");
  // <div style={{ color: "#bbb", margin: "5px 0 5px 0", fontSize: "12px" }}>
  return (
    <div style={{marginBottom:"15px"}}>
      <div className="tableview">
        <nav style={{ backgroundColor: "#333", padding: "10px" }}>
          <div className="button-grid">
            <h2 style={{ color: "white", marginBottom: "10px" }}>{title}</h2>
             <h3 style={{ color: "white", marginBottom: "10px" }}>{title2}</h3 >
            <ParkingSpacesOverviewNB />
          </div>
          <div className="button-grid" style={{ marginBottom: "5px"}}>
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
           <div style={{marginBottom: "0px",  alignItems:"center", justifyContent:"center", display:"flex"}}>
            <h2 style={{ color: "white", marginBottom: "0px" }}>{title2}</h2>
          </div>
          <div style={{marginBottom: "10px",  alignItems:"center", justifyContent:"center", display:"flex"}}>
          <ParkingSpacesOverviewNB />
          </div>

          <div className="button-grid-lc">
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
    </div>

  );
}
