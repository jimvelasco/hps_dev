import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import { useLoggedInUser } from "../hooks/useLoggedInUser";
import DashboardNavbar from "../components/DashboardNavbar";
import HoaInformation from "../components/HoaInformation";

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

  // const handleViolationsClick = () => {
  //   navigate(`/${hoaId}/violations`);
  // };

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
    // {
    //   label: "Violations",
    //   onClick: handleViolationsClick,
    //   color: "#2196f3",
    //   hoverColor: "#1976d2",
    //   which: "standard"
    // },
    // {
    //   label: "Users",
    //   onClick: handleUsersClick,
    //   color: "#2196f3",
    //   hoverColor: "#1976d2"
    // },
    // {
    //   label: "Notifications",
    //   onClick: handleNotificationsClick,
    //   which: "standard"
    // },
     ];
      if (loggedInUser.role != "admin") {

      navButtons.push({
      label: "Profile",
      onClick: handleProfileClick,
      color: "#2196f3",
      hoverColor: "#1976d2",
      which: "standard"
    });
    }
     navButtons.push({
      label: "Logout",
      onClick: handleLogout,
      which: "goback"
    }
  )
 
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
    <div style={{ marginTop: "0px",minHeight: "100vh", backgroundColor: "#f5f5f5", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <DashboardNavbar title={`${ttitle} Dashboard`} buttons={navButtons} />


      <div className="page-content">
        <div className="standardtitlebar" style={{marginTop:"10px"}}>
          <h1>Welcome to {hoa?.name}</h1>
        </div>

        <HoaInformation hoa={hoa} />
      </div>
    </div>
  );
}
