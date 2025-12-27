import './styles/global.css';
import React, { useEffect, useState } from "react";
import { useParams, Routes, Route, useNavigate } from "react-router-dom";
import axios from "./services/api";
import { HoaProvider, useHoa } from "./context/HoaContext";
import { ErrorProvider, useError } from "./context/ErrorContext";
import RentersLogin from "./pages/RentersLogin";
import RenterVehicles from "./pages/RenterVehicles";
//import Renters from "./pages/xRenters";
import ErrorPage from "./pages/ErrorPage";
import OwnersDashboard from "./pages/OwnersDashboard";
import OnsiteVehicles from "./pages/OnsiteVehicles";
import Violations from "./pages/Violations";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import Notifications from "./pages/Notifications";
// import Vehicles from "./pages/Vehicles";
import OwnerVehicles from "./pages/OwnerVehicles";
import VehicleDetails from "./pages/VehicleDetails";
import OwnersLogin from "./pages/OwnersLogin";
import Administration from "./pages/administration/Administration";
import PaymentRanges from "./pages/administration/PaymentRanges";
import ContactInformation from "./pages/administration/ContactInformation";
import HoaSettings from "./pages/administration/HoaSettings";
import TestPage from "./pages/TestPage";
import UserProfile from "./pages/UserProfile";
import ParkingPayment from "./pages/ParkingPayment";
import TermsAndConditions from "./pages/TermsAndConditions";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

function LandingPage({ backgroundImage, hoaId, hoaError }) {
  const navigate = useNavigate();
  // console.log("LandingPage length hoaId:", hoaId.length);

  const buttonStyle = {
    padding: "8px 16px",
    fontSize: "16px",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s",

  };


  return (
    <div style={{
      backgroundImage: backgroundImage,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <div className="standardtitlebar">
        <h1 style={{ fontSize: "24px" }}>HOA Parking Solutions</h1>
      </div>

      {hoaError ? (
        <div className="displayerror">
          <p style={{ color: "#d32f2f", fontSize: "16px", fontWeight: "bold" }}>
            <div>We have a problem with your HOA ID.</div><div>Please check that you entered it correctly</div>
          </p>
        </div>
      ) : (!hoaId) ? (
        <div className="displayerror">
          <p style={{ color: "#d32f2f", fontSize: "16px", fontWeight: "bold" }}>
            Please provide a valid Hoa Id in the Url. <br /><br />
            (Example: www.hoaparkingsolutions.com/YV)
          </p>
        </div>
      ) : (
        <div style={{
          marginTop: "30px", width: "350px", margin: "auto", backgroundColor: "#fff", borderRadius: "8px",
          border: "0px solid #000000", padding: "10px",
          display: "flex", justifyContent: "space-evenly", opacity: ".8"
        }}>
          <button className="standardsubmitbutton"
            onClick={() => navigate(`/${hoaId}/ownerslogin`)}>
            Owners
          </button>
          <button className="standardsubmitbutton"
            onClick={() => navigate(`/${hoaId}/renterslogin`)} >
            Renters
          </button>
        </div>
      )}
    </div>
  );
}

function AppContent() {
  let { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const [hoaError, setHoaError] = useState(null);

  useEffect(() => {
    if (hoaId) {
      fetchHoaById(hoaId).catch((err) => {
        setAppError(err.message || "Failed to load HOA data");
        //navigate("/error");
        navigate(`/${hoaId}/error`);
      });
    }
  }, [hoaId, fetchHoaById, setAppError, navigate])

  // useEffect(() => {
  //   // if (hoaId || (hoaId.length === 2 )) {

  //   if (hoaId) {
  //      //console.log("app.jsxFetching HOA data for ID:", hoaId);
  //     //  hoaId = hoaId.toUpperCase();
  //     fetchHoaById(hoaId).catch((err) => {
  //        setHoaError(err.message || "Failed to load HOA data");
  //       // setHoaError("Failed to load HOA data");
  //     });
  //   } else {
  //     navigate("/");
  //   }
  // }, [hoaId, fetchHoaById, setAppError, navigate]);

  if (loading) {
    return <div>Loading HOA data...</div>;
  }

  if (error) {
    return <LandingPage backgroundImage="" hoaId={hoaId} hoaError={error} />;
  }

  const backgroundImage = hoa && hoa.background_image_url ? `url('${hoa.background_image_url}')` : "";

  return <LandingPage backgroundImage={backgroundImage} hoaId={hoaId} hoaError={hoaError} />;
}

// <Route path="/:hoaId/vehicledetails/:vehicleId" element={<VehicleDetails />} />

function App() {
  return (
    <ErrorProvider>
      <HoaProvider>
        <Routes>
          <Route path="/" element={<LandingPage backgroundImage="" hoaId={null} />} />
          <Route path="/:hoaId" element={<AppContent />} />
          <Route path="/:hoaId/ownerslogin" element={
              <OwnersLogin />
          } />
          <Route path="/:hoaId/dashboard" element={
            <ProtectedRoute>
              <OwnersDashboard />
            </ProtectedRoute>
          } />
          <Route path="/:hoaId/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/:hoaId/onsite" element={
            <ProtectedRoute>
              <OnsiteVehicles />
            </ProtectedRoute>} />

          {/* <Route path="/:hoaId/renters" element={<Renters />} /> */}

          <Route path="/:hoaId/violations" element={
            <ProtectedRoute>
              <Violations />
            </ProtectedRoute>
          } />
          <Route path="/:hoaId/users" element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/:hoaId/user" element={
            <ProtectedRoute>
              < UserDetails />
            </ProtectedRoute>
              } />
          <Route path="/:hoaId/user/:userId" element={
            <ProtectedRoute>
              <UserDetails />
            </ProtectedRoute>
          } />
          <Route path="/:hoaId/renterslogin" element={
              <RentersLogin />
          } />
          
          <Route path="/:hoaId/rentervehicles/:unitNumber" element={
              <RenterVehicles />
          } />

          {/* <Route path="/:hoaId/rentervehicles" element={<RenterVehicles />} /> */}

          <Route path="/:hoaId/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          {/* <Route path="/:hoaId/vehicles" element={<OwnerVehicles />} /> */}
          <Route path="/:hoaId/ownervehicles" element={
            <ProtectedRoute>
              <OwnerVehicles />
            </ProtectedRoute>
          } />
          <Route path="/:hoaId/vehicledetails/:which/:vehicleId" element={
            <ProtectedRoute>
              <VehicleDetails />
              </ProtectedRoute>
          } />
          <Route path="/:hoaId/terms-and-conditions" element={
            <ProtectedRoute>
              <TermsAndConditions />
            </ProtectedRoute>
          } />
          
          <Route path="/:hoaId/admin" element={
              <Administration />
          } />
          <Route path="/:hoaId/hoa-settings" element={
            <ProtectedRoute>
              <HoaSettings />
            </ProtectedRoute>
          } />
          <Route path="/:hoaId/payment-ranges" element={
            <ProtectedRoute>
              <PaymentRanges />
            </ProtectedRoute>
          } />
          <Route path="/:hoaId/contact-information" element={
            <ProtectedRoute>
              <ContactInformation />
            </ProtectedRoute>
          } />
           <Route path="/:hoaId/payment" element={
             <ParkingPayment />
          } />

          <Route path="/:hoaId/test" element={<TestPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password-error" element={<ErrorPage />} />
          <Route path="/error" element={<ErrorPage />} />
         
          <Route path="/:hoaId/error" element={
            <ProtectedRoute>
              <ErrorPage />
            </ProtectedRoute>
          } />
        </Routes>
      </HoaProvider>
    </ErrorProvider>
  );
}

export default App;