import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import { useLoggedInUser } from "../hooks/useLoggedInUser";
import DashboardNavbar from "../components/DashboardNavbar";

import ParkingSpacesOverview from "../components/ParkingSpacesOverview";

// Then in your JSX:
<ParkingSpacesOverview />

export default function OwnersDashboard() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const { user: loggedInUser, loading: userLoading, clearLoggedInUser } = useLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  let tlink = "ownervehicles";
  if (role === "admin") {
    tlink = "ownervehicles";
  } 

  // useEffect(() => {
  //   if (hoaId) {
  //     fetchHoaById(hoaId).catch((err) => {
  //       setAppError(err.message || "Failed to load HOA data");
  //      // navigate("/error");
  //        navigate(`/${hoaId}/error`);
  //     });
  //   }
  // }, [hoaId, fetchHoaById, setAppError, navigate]);

  if (loading || userLoading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (error) {
    setAppError(error);
   // navigate("/error");
     navigate(`/${hoaId}/error`);
    return null;
  }

  const handleLogout = () => {
    clearLoggedInUser();
    navigate(`/${hoaId}`);
  };

  const handleOnsiteClick = () => {
    navigate(`/${hoaId}/onsite`);
  };

   const handleVehiclesClick = () => {
    navigate(`/${hoaId}/${tlink}`);
  };

  const handleViolationsClick = () => {
    navigate(`/${hoaId}/violations`);
  };

  const handleUsersClick = () => {
    navigate(`/${hoaId}/users`);
  };

  const handleNotificationsClick = () => {
    navigate(`/${hoaId}/notifications`);
  };

  const handleProfileClick = () => {
    navigate(`/${hoaId}/profile`);
  };

  let navButtons = [
     {
      label: "Vehicles",
      onClick: handleVehiclesClick,
      color: "#2196f3",
      hoverColor: "#1976d2",
      which: "standard"
    },
    {
      label: "Onsite",
      onClick: handleOnsiteClick,
      color: "#2196f3",
      hoverColor: "#1976d2",
       which: "standard"
    },
    {
      label: "Violations",
      onClick: handleViolationsClick,
      color: "#2196f3",
      hoverColor: "#1976d2",
       which: "standard"
    },
    // {
    //   label: "Users",
    //   onClick: handleUsersClick,
    //   color: "#2196f3",
    //   hoverColor: "#1976d2"
    // },
    {
      label: "Notifications",
      onClick: handleNotificationsClick,
       which: "standard"
    },
    {
      label: "Profile",
      onClick: handleProfileClick,
      color: "#2196f3",
      hoverColor: "#1976d2",
       which: "standard"
    },
    {
      label: "Logout",
      onClick: handleLogout,
       which: "goback"
    }
  ];
  if (loggedInUser.role == "admin") {
    navButtons.unshift({
      label: "Users",
      onClick: handleUsersClick,
       which: "standard"
    });
     navButtons.unshift({
      label: "Admin",
      onClick: () => navigate(`/${hoaId}/admin`),
       which: "standard"
    });
    
    } 

  let backgroundImage = '';
  let ttitle = "Administrator";
  if (hoa) {
    backgroundImage = hoa.background_image_url;
    if (loggedInUser.role == "owner") {
      ttitle = "Owner";
    } else if (loggedInUser.role == "renter") {
      ttitle = "Renter";
    }
  //  console.log('OwnersDashboard hoa:', hoa);
  }
 // console.log("OwnersDashboard render loggedInUser", loggedInUser);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed"   }}>
      <DashboardNavbar title={`${ttitle} Dashboard`} buttons={navButtons} />

       {/* <div style={{
        textAlign: "center", backgroundColor: "#fff", opacity: ".8",
        borderRadius: "8px", width: "70%", margin: "auto", fontcolor: "#000"
      }}>
        <h1 style={{ fontSize: "24px", padding: "10px" }}>Welcome to {hoa?.name}</h1>
      </div> */}

      <div  className="page-content">
         <div className="standardtitlebar">
        <h1>Welcome to {hoa?.name}</h1>
      </div>
       

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "10px",
          marginTop: "30px"
        }}>
          {/* <section style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ color: "#1976d2", marginTop: 0 }}>HOA Information</h3>
            {hoa && (
              <div>
                <p><strong>HOA ID:</strong> {hoa._id}</p>
                <p><strong>Name:</strong> {hoa.name}</p>
                <p><strong>Address:</strong> {hoa.address}</p>
                <p><strong>City:</strong> {hoa.city}</p>
                <p><strong>State:</strong> {hoa.state}</p>
                <p><strong>ZIP:</strong> {hoa.zip}</p>
              </div>
            )}
          </section> */}
           {hoa?.contact_information && hoa.contact_information.length > 0 && (
            <section className="standardsection">
              <h3 style={{ color: "#1976d2", marginTop: 0 }}>Contact Information</h3>
              <ul style={{ paddingLeft: "20px" }}>
                {hoa.contact_information.map((contact, index) => (
                  <li key={index}>
                    <strong>{contact.phone_description || "Contact"}:</strong><br />
                    {contact.phone_number && <span>Phone: {contact.phone_number}<br /></span>}
                    {contact.email && <span>Email: {contact.email}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="standardsection">
            <h3 style={{ color: "#1976d2", marginTop: 0 }}>Parking Settings</h3>
            {hoa && (
              <>
              <ul style={{ paddingLeft: "20px" }}>
                <li>HOA Parking Allowed: {hoa.parking_allowed_hoa}</li>
                <li>Owner Inventory Allowed: {hoa.inventory_allowed_owner}</li>
                <li>Owner Parking Allowed: {hoa.parking_allowed_owner}</li>
                <li>Renter Parking Allowed: {hoa.parking_allowed_renter}</li>
                <li>Owner Free Spots: {hoa.owner_free_parking_spots}</li>
                <li>Renter Free Spots: {hoa.renter_free_parking_spots}</li>
              </ul>
               {/* <h3 style={{ color: "#1976d2", marginTop: 0 }}>Parking Spaces</h3>
            <ParkingSpacesOverview /> */}
            </>
            )}

            {/* <h3 style={{ color: "#1976d2", marginTop: 0 }}>Payment Settings</h3>
            {hoa && (
              <div>
                <p><strong>Owner Credit Card:</strong> {hoa.use_owner_creditcard ? "Enabled" : "Disabled"}</p>
                <p><strong>Renter Credit Card:</strong> {hoa.use_renter_creditcard ? "Enabled" : "Disabled"}</p>
                <p><strong>Owner PPP:</strong> {hoa.use_owner_ppp ? "Enabled" : "Disabled"}</p>
                <p><strong>Renter PPP:</strong> {hoa.use_renter_ppp ? "Enabled" : "Disabled"}</p>
              </div>
            )} */}



          </section>
          <section className="standardsection">
             <h3 style={{ color: "#1976d2", marginTop: 0 }}>Parking Spaces</h3>
            <ParkingSpacesOverview />
            </section>

          {/* <section style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ color: "#1976d2", marginTop: 0 }}>Seasonal Settings</h3>
            {hoa && (
              <div>
                <p><strong>Season Adjust Unit:</strong> {hoa.season_adjust_unit}</p>
                <p><strong>Season Adjust Renter:</strong> {hoa.season_adjust_renter}</p>
                <p><strong>Parking Fee Factor:</strong> {hoa.season_parking_fee_factor}</p>
              </div>
            )}
          </section> */}
          

          {/* <section style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ color: "#1976d2", marginTop: 0 }}>Payment Settings</h3>
            {hoa && (
              <div>
                <p><strong>Owner Credit Card:</strong> {hoa.use_owner_creditcard ? "Enabled" : "Disabled"}</p>
                <p><strong>Renter Credit Card:</strong> {hoa.use_renter_creditcard ? "Enabled" : "Disabled"}</p>
                <p><strong>Owner PPP:</strong> {hoa.use_owner_ppp ? "Enabled" : "Disabled"}</p>
                <p><strong>Renter PPP:</strong> {hoa.use_renter_ppp ? "Enabled" : "Disabled"}</p>
              </div>
            )}
          </section> */}

         
        </div>
      </div>
    </div>
  );
}
