import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import { useLoggedInUser } from "../hooks/useLoggedInUser";
import DashboardNavbar from "../components/DashboardNavbar";
import HoaInformation from "../components/HoaInformation";
import { getAWSResource } from "../utils/awsHelper";
import axios from "../services/api";

export default function OwnersDashboard() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const { user: loggedInUser, loading: userLoading, clearLoggedInUser } = useLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  const [stripeStatus, setStripeStatus] = useState({ onboardingComplete: false });
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeSuccess, setStripeSuccess] = useState(null);
  const [stripeErrorMsg, setStripeErrorMsg] = useState(null);

  let tlink = "ownervehicles";
  if (role === "admin") {
    tlink = "ownervehicles";
  }

  useEffect(() => {
    if (role === "admin" && hoa) {
      checkStripeStatus();
    }
  }, [role, hoa]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("stripe_onboarding") === "success") {
      setStripeSuccess("Stripe onboarding completed successfully!");
      checkStripeStatus();
    } else if (params.get("stripe_onboarding") === "refresh") {
      setStripeErrorMsg("Stripe onboarding was interrupted. Please try again.");
    }
  }, [location]);

  const checkStripeStatus = async () => {
    try {
      const response = await axios.get(`/hoas/${hoaId}/stripe-status`);
      setStripeStatus(response.data);
    } catch (err) {
      console.error("Error checking Stripe status:", err);
    }
  };

  const handleConnectStripe = async () => {
    setStripeLoading(true);
    setStripeErrorMsg(null);
    try {
      const response = await axios.post(`/hoas/${hoaId}/stripe-connect`);
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      setStripeErrorMsg("Failed to initialize Stripe onboarding");
      console.error("Stripe connect error:", err);
    } finally {
      setStripeLoading(false);
    }
  };

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

  const handleReportClick = () => {
    navigate(`/${hoaId}/reports`);
  };

  const handleLogout = () => {
    clearLoggedInUser();
    navigate(`/${hoaId}`);
  };

  const handleOnsiteClick = () => {
    navigate(`/${hoaId}/onsite`);
  };

  const handleVehiclesClick = () => {
  //  console.log('handleVehiclesClick role is:',role);
    navigate(`/${hoaId}/${tlink}/${role}`);
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
      label: "Reports",
      onClick: handleReportClick,
      which: "standard"
    }
  )

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
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
  }  
  
  let ttitle = "Administrator";
  if (hoa) {
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
      <DashboardNavbar title={`${ttitle} Dashboard`} title2={hoa?.name} buttons={navButtons} />


      <div className="page-content">
        <div className="standardtitlebar" style={{marginTop:"10px"}}>
          <h2>Welcome to {hoa?.name}</h2>
        </div>

        <HoaInformation hoa={hoa} />

        {stripeErrorMsg && (
          <div className="editable-table-error" style={{ maxWidth: "320px", margin: "10px auto" }}>
            {stripeErrorMsg}
          </div>
        )}

        {stripeSuccess && (
          <div className="editable-table-success" style={{ maxWidth: "320px", margin: "10px auto" }}>
            {stripeSuccess}
          </div>
        )}

        {role === "admin" && (
          <section className="standardsection-wide" style={{  justifyItems: "center", alignItems: "center", display: "flex", flexDirection: "column", maxWidth: "320px", margin: "20px auto" }}>
            <h3 style={{ color: "#1976d2", marginTop: 0 }}>Stripe Payouts</h3>
            <p style={{ fontSize: "14px", marginBottom: "15px" }}>
              To receive payments, you must connect your Stripe account. 
              HOA Parking Solutions takes a small fee from each transaction and deposits the rest directly into your account.
            </p>
            
            {stripeStatus.onboardingComplete ? (
              <div style={{  padding: "15px", backgroundColor: "#e8f5e9", borderRadius: "4px", border: "1px solid #c8e6c9", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#2e7d32", fontSize: "20px" }}>✅</span>
                <div>
                  <strong style={{ color: "#2e7d32" }}>Stripe Connected & Ready</strong>
                  <div style={{ fontSize: "12px", color: "#4caf50" }}>
                    Payments and transfers are active.
                  </div>
                </div>
              </div>
            ) : stripeStatus.details_submitted ? (
              <div style={{  padding: "15px", backgroundColor: "#fff3e0", borderRadius: "4px", border: "1px solid #ffe0b2" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <span style={{ color: "#ef6c00", fontSize: "20px" }}>⏳</span>
                  <strong style={{ color: "#ef6c00" }}>Pending Verification</strong>
                </div>
                <p style={{ fontSize: "13px", margin: "0 0 10px 0" }}>
                  Your details have been submitted, but Stripe is still verifying your account for transfers. 
                  This usually takes a few minutes but can take up to 24 hours.
                </p>
                <button
                  onClick={handleConnectStripe}
                  disabled={stripeLoading}
                  className="btn btn-default"
                  style={{ width: "auto", fontSize: "12px" }}
                >
                  {stripeLoading ? "Checking..." : "Check Status on Stripe"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectStripe}
                disabled={stripeLoading}
                className="btn btn-primary"
                style={{ width: "auto" }}
              >
                {stripeLoading ? "Connecting..." : "Connect Stripe Express"}
              </button>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
