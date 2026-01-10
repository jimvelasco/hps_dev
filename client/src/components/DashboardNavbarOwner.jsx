import React from "react";
import { useLoggedInUser } from "../hooks/useLoggedInUser";
import NavButton from "./NavButton";
import ParkingSpacesOverviewNB from "./ParkingSpacesOverviewNB";


export default function DashboardNavbarOwner({ title, buttons }) {
  const { user: loggedInUser } = useLoggedInUser();
  let role = null;
  let roletitle = "Administrator";
  if (loggedInUser) {
    role = loggedInUser.role;
    if (role === "owner") {
      roletitle = "Owner";
    }
  } else {
    console.log("DashboardNavbar: no loggedInUser found");
  }
 

  return (
    <>
    <nav className="navbar">
        <h2 style={{ color: "white", margin: 0 }}>{title}</h2>
        {!loggedInUser && (
          <div style={{ color: "#bbb", margin: "5px 0 5px 0", fontSize: "12px" }}>
            <ParkingSpacesOverviewNB />
          </div>
        )}
        <div >
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
      </div>
    </nav>
    </>
  );
}
