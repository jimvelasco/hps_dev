import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import { useLoggedInUser } from "../hooks/useLoggedInUser";
import DashboardNavbar from "../components/DashboardNavbar";
import "../styles/global.css";

export default function TermsAndConditions() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading: hoaLoading, error: hoaError, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const { user: loggedInUser, loading: userLoading } = useLoggedInUser();
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { role } = location.state || {};

  useEffect(() => {
    if (hoaId) {
      fetchHoaById(hoaId).catch((err) => {
        setAppError(err.message || "Failed to load HOA data");
        navigate(`/${hoaId}/error`);
      });
    }
  }, [hoaId, fetchHoaById, setAppError, navigate]);

  useEffect(() => {
    if (!hoaLoading && !userLoading) {
      setLoading(false);
    }
  }, [hoaLoading, userLoading]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const navButtons = [
    {
      label: "Back",
      onClick: handleBackClick,
      which: "goback"
    }
  ];

  let backgroundImage = '';
  if (hoa) {
    backgroundImage = hoa.background_image_url;
  }

  // const userRole = loggedInUser?.role || null;
  const userRole = role

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <DashboardNavbar title="Terms and Conditions" buttons={navButtons} />
        <div className="ajaxloader">
          <p style={{ color: "#666" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (hoaError) {
    setAppError(hoaError);
    navigate(`/${hoaId}/error`);
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <DashboardNavbar title="Terms and Conditions" buttons={navButtons} />
       <embed src="https://hoaparking.s3.us-east-1.amazonaws.com/YV/YV-Terms_and_Conditions.pdf" 
       type="application/pdf" width="100%" height="600px" />

       <div className="page-content">
        <div style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>
          <h2 style={{ color: "#333", marginTop: 0 }}>Terms and Conditions</h2>

          {/* General Terms and Conditions - Always Shown */}
          <div style={{ display: "block", marginBottom: "30px" }}>
            <h3 style={{ color: "#1976d2" }}>General Terms and Conditions</h3>
              <div style={{ color: "#666", lineHeight: "1.6" }}>
                <ul>
                  <li>Owners must register their own vehicles and visitor’s vehicles, if parked in our lots overnight, in Yampa Views’s Parking App and set each vehicle’s ONSITE indicator to YES or NO accordingly.</li>
                  <li>Renters must register their vehicles (under the unit number they’re renting from), if parked in our lots at any time, in the Parking App. It is the owner's responsibility to inform your renters that they must register their vehicles.</li>
                  <li>Maximum 2 registered vehicles per unit in our parking lots at any time, unless temporary permission is granted by the Mgmt. Company.</li>
                  <li>Park within marked parking spaces, using good judgment when snow is on the ground.</li>
                  <li>Do not obstruct/block driveways, walkways, parking spaces, trash receptacles, shuttle bus turnaround, or snow storage area.</li>
                  <li>No parking in driveway leading into upper parking lot.</li>
                  <li>When new snow falls, move your vehicle daily to allow for snow plowing.</li><li>No inoperative, immobile, stored, or expired tag vehicles.</li>
                  <li>No vehicle major maintenance, including oil changes.</li>
                  <li>No playing baseball, softball, or any other activity which may damage vehicles or property.</li>
                  <li>Parking violations may be subject to immediate towing or booting, at owner expense.</li>
                  <li>No trailers or oversized vehicles.  NOTE: Owners see Rules and Regulations.</li>
                </ul>
              </div>
              <div style={{ color: "#666", lineHeight: "1.6" }}>
                 <h3 style={{ color: "#1976d2" }}>Permissions</h3>
                <p>Contact Yampa View Property Management (PM) to request permission to temporarily park any vehicle not allowed per Yampa View regulations. 
                  You can call or send a message to the PM through the application once you have logged in as an owner or guest. </p>
                <ul>
                  <li> Any additional vehicle over the assigned limit. NOTE: Limits can be changed during peak times.</li>
                  <li> For any oversized vehicle or trailer (wider or 4 feet longer than its parking space).</li>
                  <li> Contractor dumpster or storage trailer. NOTE: A miminum of one week notice must be submitted to Yampa View Property Management for approval. </li>
                  <li>If permission is granted, you must register the vehicle (if it hasn’t been previously registered). Oversized vehicles must be parked either in the lower lot or parallel to the upper lot cliff.</li>
                </ul>
              </div>
          </div>

          {/* Owner Terms and Conditions - Show if user role is owner */}
          <div style={{ display: userRole === "owner" ? "block" : "none", marginBottom: "30px" }}>
            <h3 style={{ color: "#1976d2" }}>Owner Terms and Conditions</h3>
              <div style={{ color: "#666", lineHeight: "1.6" }}>
                <ol>
                  <li>Prior to registering your vehicle(s), it is imperative that you read Yampa View’s Rules and Regulations, located in AppFolio, where the parking rules reside.</li>
                  <li>As an owner, it is your responsibility to register your vehicles in Yampa View’s Parking App and set the ONSITE value to “Yes” or “No”</li>
                  <li>It is your responsibility to provide a pincode and to inform your vacation renters that they must register their vehicles.</li>
                  <li>VIOLATION OF THESE TERMS AND CONDITIONS MAY RESULT IN YOU BEING FINED, AND/OR YOU OR YOUR VACATION RENTER’S VEHICLE BEING TOWED OR BOOTED AT OWNER EXPENSE!!</li>
                </ol>
              </div>
          </div>

          {/* Renter Terms and Conditions - Show if user role is renter */}
          <div style={{ display: userRole === "renter" ? "block" : "none", marginBottom: "30px" }}>
            <h3 style={{ color: "#1976d2" }}>Renter Terms and Conditions</h3>
              <div style={{ color: "#666", lineHeight: "1.6" }}>
                <ul>
                  <li> Renters must register their vehicles under the unit number they are renting from, if parked in our lots at any time.&nbsp; The Checkout Date entered cannot be exceeded. </li>
                  <li> Renters may park no more than 2 registered vehicles in our lots at any given time. Please only register a second vehicle if it is necessary, as parking is limited. </li>
                  <li> Park within marked parking spaces, using good judgment when snow is on the ground.</li>
                  <li> Do not obstruct or block driveways, walkways, parking spaces, trash receptacles, shuttle bus turnaround, or snow storage areas.</li>
                  <li> No parking in driveway leading into upper parking lot.</li>
                  <li> When new snow falls, move your vehicle daily to allow for snow plowing.</li>
                  <li> No inoperative, immobile, stored, or expired tag vehicles. </li>
                  <li> No vehicle major maintenance, including oil changes.</li>
                  <li> No playing baseball, softball, or any other activity which may damage vehicles or property.</li>
                  <li> Parking violations may be subject to immediate towing or booting, at owner expense.</li>
                  <li> No trailers or oversized vehicles permitted. </li>
                </ul>
                <h6>VIOLATION OF THESE TERMS AND CONDITIONS MAY RESULT IN YOUR VEHICLE BEING TOWED OR BOOTED, AT YOUR EXPENSE!!</h6>
              </div>
          </div>
        </div>
      </div>
     

    </div>
  );
}
