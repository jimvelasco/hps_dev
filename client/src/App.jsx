import './styles/global.css';
import React, { useEffect, useState } from "react";
import { useParams, Routes, Route, useNavigate } from "react-router-dom";
import axios from "./services/api";
import { HoaProvider, useHoa } from "./context/HoaContext";
import { ErrorProvider, useError } from "./context/ErrorContext";
import HoaSelector from "./pages/HoaSelector";
import LandingPage from "./pages/LandingPage";
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
import PaymentRefund from "./pages/administration/PaymentRefund";
import UpdateAllUsers from "./pages/administration/UpdateAllUsers";
import ContactInformation from "./pages/administration/ContactInformation";
import HoaSettings from "./pages/administration/HoaSettings";
import ImageUpload from "./pages/administration/ImageUpload";
import PDFUpload from "./pages/administration/PDFUpload";
import TestPage from "./pages/TestPage";
import UserProfile from "./pages/UserProfile";
import ParkingPayment from "./pages/ParkingPayment";
import TermsAndConditions from "./pages/TermsAndConditions";
import ResetPassword from "./pages/ResetPassword";
import EmailFromHoa from "./pages/EmailFromHoa";
import About from "./pages/About";
import ProtectedRoute from "./components/ProtectedRoute";
import { getAWSResource } from "./utils/awsHelper";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);


function AppContent() {
  let { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const bimage = 'http://hoaparking.s3.amazonaws.com/steamboat-ski-resort.jpg';
  useEffect(() => {
    if (hoaId) {
      fetchHoaById(hoaId).catch((err) => {
        setAppError(err.message || "Failed to load HOA data");
        navigate(`/${hoaId}/error`);
      });
    }
  }, [hoaId, fetchHoaById, setAppError, navigate])

   if (loading) {
    return (
      <div className="standardtitlebar" style={{marginTop:"50px",backgroundColor:"cyan"}}>
        <h1>Loading HOA data...</h1>
      </div>)
     
  }


  // let backgroundImage = hoa && hoa.background_image_url ? 
  // `url('${hoa.background_image_url}')` :
  //  "http://hoaparking.s3.amazonaws.com/xyampa_103022.jpg";

  // src={`${getAWSResource(hoa, 'RTC')}`}

  let backgroundImage = hoa && hoa.background_image_url ? 
`url(${getAWSResource(hoa, 'BI')})` : "http://hoaparking.s3.amazonaws.com/xyampa_103022.jpg"

// if (hoa) {
//   console.log('background image is',hoa.background_image_url);
//    backgroundImage = getAWSResource(hoa, 'BI');
//     console.log('aws background image is',backgroundImage);
// }
  return <LandingPage backgroundImage={backgroundImage} hoaId={hoaId} hoaError={error} />;
}



// <Route path="/:hoaId/vehicledetails/:vehicleId" element={<VehicleDetails />} />



function App() {
  return (
    <ErrorProvider>
      <HoaProvider>
        <Elements stripe={stripePromise}>
          <Routes>
          <Route path="/" element={<HoaSelector />} />
          <Route path="/about" element={<About />} />
          <Route path="/:hoaId/about" element={<About />} />
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
          <Route path="/:hoaId/image-upload" element={
            <ProtectedRoute>
              <ImageUpload />
            </ProtectedRoute>
          } />
          <Route path="/:hoaId/pdf-upload" element={
            <ProtectedRoute>
              <PDFUpload />
            </ProtectedRoute>
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
          <Route path="/:hoaId/payment-refund" element={
            <ProtectedRoute>
              <PaymentRefund />
            </ProtectedRoute>
          } />
          <Route path="/:hoaId/update-all-users" element={
            <ProtectedRoute>
              <UpdateAllUsers />
            </ProtectedRoute>
          } />
          <Route path="/:hoaId/contact-information" element={
            <ProtectedRoute>
              <ContactInformation />
            </ProtectedRoute>
          } />
          <Route path="/:hoaId/email-from-hoa" element={
            <EmailFromHoa />
          } />
           <Route path="/email-from-hoa" element={
            <EmailFromHoa />
          } />

          <Route path="/:hoaId/payment" element={
            <ParkingPayment />
          } />

          <Route path="/:hoaId/test" element={<TestPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password-error" element={<ErrorPage />} />
          <Route path="/:hoaId/error" element={

            <ErrorPage />
          } />
          <Route path="/error" element={<ErrorPage />} />


        </Routes>
        </Elements>
      </HoaProvider>
    </ErrorProvider>
  );
}

export default App;