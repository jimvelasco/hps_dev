import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../services/api";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import DashboardNavbar from "../components/DashboardNavbar";
import ModalAlert from "../components/ModalAlert";
import { getAWSResource } from "../utils/awsHelper";


const StripePaymentForm = ({ amount, vehicle, hoa, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL is required for some payment methods, but for card it might not be if we handle it here
        // However, Stripe often expects one. Since we want to handle the post-payment logic ourselves:
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "white", borderRadius: "4px", border: "1px solid #ddd" }}>
        <h4 style={{ marginTop: 0, marginBottom: "15px" }}>Credit Card Information</h4>
        <PaymentElement options={{ layout: "tabs" }} />
        {errorMessage && <div style={{ color: "red", marginTop: "10px" }}>{errorMessage}</div>}
      </div>
      <div>
        <div>4242 4242 4242 4242</div>
        <div>12/34</div>
        <div>123</div>
        <div>12345</div>
        <div>matercard</div>
        <div>5555 5555 5555 4444</div>
        <div>decline</div>
        <div>4000 0000 0000 9995</div>
        <div>insuffecient funds</div>
        <div>4000 0000 0000 9995</div>
        <div>incorrect cvc</div>
        <div>4000 0000 0000 0127</div>
         <div>espired card</div>
        <div>4000 0000 0000 0069</div>
      </div>

      <div className="button-grid" style={{ marginTop: "20px" }}>
       {/* // <style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}> */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
        </button>
        <button type="button" className="btn btn-default" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default function ParkingPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { vehicleId, unitNumber, hoaId, role } = location.state;
  const [loading, setLoading] = useState(false);
  const { hoa, loading: hoaLoading, error: hoaError, fetchHoaById } = useHoa();
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null, onCancel: null });
  const [vehicle, setVehicle] = useState(null);
  const [numdays, setNumdays] = useState(0);
  const [error, setError] = useState(null);
  const [pricePerNight, setPricePerNight] = useState(0);
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      if (vehicle && pricePerNight && numdays && hoa) {
        try {
          const totalAmount = pricePerNight * numdays;
          const amountInCents = Math.round(totalAmount * 100);
          
          const response = await axios.post("/payments/create-payment-intent", {
            amount: amountInCents,
            metadata: {
              vehicleId,
              hoaId: hoa.hoaid,
              unitNumber
            }
          });
          setClientSecret(response.data.clientSecret);
        } catch (error) {
          console.error("Error fetching payment intent:", error);
        }
      }
    };

    fetchPaymentIntent();
  }, [vehicle, pricePerNight, numdays, vehicleId, hoa, unitNumber]);




  const getTodayInMMDD = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  };

  const getPricePerNight = () => {
    if (!hoa || !hoa.payment_ranges || hoa.payment_ranges.length === 0) {
      return 0;
    }

    const todayMMDD = getTodayInMMDD();
    console.log('todayMMDD', todayMMDD);

    const matchingRange = hoa.payment_ranges.find(range => {
      if (!range.startDayMo || !range.endDayMo) return false;

      if (range.startDayMo <= range.endDayMo) {
        return todayMMDD >= range.startDayMo && todayMMDD <= range.endDayMo;
      } else {
        return todayMMDD >= range.startDayMo || todayMMDD <= range.endDayMo;
      }
    });

    return matchingRange ? matchingRange.rate : 0;
  };

  useEffect(() => {
    if (!hoa) {
      fetchHoaById(hoaId);
    }
  }, [hoaId, hoa, fetchHoaById]);

  useEffect(() => {
    if (hoa) {
      setPricePerNight(getPricePerNight());
    }
  }, [hoa]);

  useEffect(() => {
    //  if (userLoading) {return}
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const qry = `/vehicles/id/${vehicleId}`;
        // console.log("VehicleDetails.jsx qry:", qry);
        const response = await axios.get(qry);
        setVehicle(response.data);
        console.log("Fetched vehicle data:", response.data);
        const sdate = new Date(response.data.startdate);
        const edate = new Date(response.data.enddate);
        const timeDiff = Math.abs(edate - sdate);
        const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        setNumdays(diffDays);
        console.log("numdays:", diffDays);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load vehicle details");
        console.error("Error fetching vehicle:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [vehicleId]);

  const handleStripeSuccess = async (paymentIntent) => {
    setLoading(true);
    try {
      const totalAmount = pricePerNight * numdays;
      const amountInCents = Math.round(totalAmount * 100);
      const pricePerNightCents = Math.round(pricePerNight * 100);

      const paymentId = paymentIntent.id;
      const amount = paymentIntent.amount;
      const cardLastFour = paymentIntent.payment_method_types.includes('card') ? 'xxxx' : 'xxxx'; // Stripe doesn't give last4 in paymentIntent easily without expansion
      // To get last4, we'd need to expand payment_method or use what's available
      const paymentDate = new Date().toISOString();

      console.log('Recording parking payment for vid', vehicleId);
      await axios.post("/payments/record-parking", {
        state: {
          hoaid: hoa.hoaid,
          vehicleId: vehicleId,
          checkin: vehicle.checkin,
          checkout: vehicle.checkout,
          unitnumber: vehicle.unitnumber,
          lastname: vehicle.carowner_lname,
          firstname: vehicle.carowner_fname,
          plate: vehicle.plate,
          plate_state: vehicle.plate_state,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          numdays: numdays,
          pricePerNight: pricePerNightCents,
          totalAmount: amountInCents,
          stripePaymentIntentId: paymentId,
          stripeAmount: amount,
          stripeCardLastFour: cardLastFour,
          stripePaymentDate: paymentDate
        }
      });

      console.log("Payment recorded successfully. Updating vehicle status...");
      await axios.put(`/vehicles/payment/${vehicleId}`, {
        state: {
          requires_payment: 2
        }
      });

      setModal({
        isOpen: true,
        type: "success",
        title: "Payment Successful",
        message: "Your parking payment has been processed successfully.",
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
          if (role === "renter") {
            navigate(`/${hoaId}/rentervehicles/${unitNumber}`);
          } else {
            navigate(`/${hoaId}/ownervehicles`);
          }
        }
      });
    } catch (error) {
      console.error("Error recording payment:", error);
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error Recording Payment",
        message: "Your payment was successful but we failed to record it. Please contact support.",
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    // console.log('back clicked in Vehicle Details')
    // navigate(`/${hoaId}/ownervehicles`);
    navigate(-1);
  };
  const navButtons = [
    {
      label: "Back",
      onClick: handleBackClick,
      // color: "#2196f3",
      // hoverColor: "#1976d2",
      which: "goback"
    }
  ];

  let backgroundImage = '';
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
  }
  const pageTitle = "Parking Space Payment";
  if (!vehicle) {
    return <div>Loading...</div>;
  }
  return (
    // if (loading) return;
    <div style={{ minHeight: "100vh", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <DashboardNavbar title={pageTitle} buttons={navButtons} />
      {/* <div style={{ padding: "30px", maxWidth: "600px", margin: "0 auto" }}> */}
      <div className="page-content">
        <div className="standardtitlebar" style={{ marginTop: "10px" }}>
          <h2>Parking Space Payment</h2>
        </div>
        <div style={{
          // backgroundColor: "#f0f0f0",
          padding: "30px",
          borderRadius: "8px",
          // opacity: "0.8",
          // boxShadow: "0 2px 8px rgba(0, 0, 0, 0.8)"
        }}>



          <div style={{ backgroundColor: "#f0f0f0", padding: "20px", borderRadius: "8px", width: "360px", margin: "0 auto", textAlign: "left" }}>
           


            <div className="grid-container-2-full">
              <div className="full-row"><h3>Pricing Breakdown</h3></div>
              <div>Name</div><div>{vehicle.carowner_fname} {vehicle.carowner_lname} </div>
              <div>Make</div><div>{vehicle.make}</div>
              <div>Model</div><div>{vehicle.model}</div>
              <div>Year</div><div>{vehicle.year}</div>
              <div>License Plate</div><div>{vehicle.plate}&nbsp;{vehicle.plate_state}</div>
              <div>Start Date</div><div>{vehicle.startdate}</div>
              <div>End Date</div><div>{vehicle.enddate}</div>
              <div>Days</div><div>{numdays}</div>
              <div>Price per Night</div><div>${pricePerNight.toFixed(2)}</div>
              <div>Total Payment</div><div>${(pricePerNight * numdays).toFixed(2)}</div>
            </div>

            {clientSecret ? (
              <Elements stripe={loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)} options={{ clientSecret }}>
                <StripePaymentForm 
                  amount={Math.round(pricePerNight * numdays * 100)} 
                  vehicle={vehicle} 
                  hoa={hoa} 
                  onSuccess={handleStripeSuccess} 
                  onCancel={() => navigate(-1)} 
                />
              </Elements>
            ) : (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <p>Loading payment form...</p>
              </div>
            )}
          </div>



          <ModalAlert
            isOpen={modal.isOpen}
            type={modal.type}
            title={modal.title}
            message={modal.message}
            confirmText={modal.confirmText}
            cancelText={modal.cancelText}
            onConfirm={modal.onConfirm}
            onCancel={modal.onCancel}
          />
        </div>
      </div>
    </div>
  );
}
