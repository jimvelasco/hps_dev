import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../services/api";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import { useSquarePayments } from "../hooks/useSquarePayments";
import { useSquareCard } from "../hooks/useSquareCard";
import DashboardNavbar from "../components/DashboardNavbar";
import ModalAlert from "../components/ModalAlert";
import { getAWSResource } from "../utils/awsHelper";


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

  const { payments, error: squareError } = useSquarePayments();
  const { cardRef, tokenize, loading: cardLoading, error: cardError } = useSquareCard(payments);


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

  const handlePayment = async () => {
    setLoading(true);
    try {
      const totalAmount = pricePerNight * numdays;
      const amountInCents = Math.round(totalAmount * 100);

      console.log('Tokenizing card for payment:', { vehicleId, totalAmount });
      const token = await tokenize();


      console.log('Sending payment to Square:', { token, amount: amountInCents });
      const squareResponse = await axios.post("/payments/square", {
        token,
        amount: amountInCents,
        parkingSessionId: vehicleId
      });

      if (squareResponse.data.success) {
        console.log("Square payment successful:", squareResponse.data.payment);

        console.log('Recording parking payment for vid', vehicleId);
        await axios.post("/payments/record-parking", {
          state: {
            vehicleId: vehicleId,
            checkin: vehicle.checkin,
            checkout: vehicle.checkout
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
          type: "alert",
          title: "Payment Successful",
          message: `Payment of $${totalAmount.toFixed(2)} processed successfully!`,
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
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setModal({
        isOpen: true,
        type: "alert",
        title: "Payment Failed",
        message: error.response?.data?.message || error.message || "Payment processing failed",
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const stubhandlePayment = async () => {
    setLoading(true);
    try {
      const totalAmount = pricePerNight * numdays;
      const amountInCents = Math.round(totalAmount * 100);

      console.log('Tokenizing card for payment:', { vehicleId, totalAmount });


      // const token = await tokenize();

      // console.log('Sending payment to Square:', { token, amount: amountInCents });
      // const squareResponse = await axios.post("/payments/square", {
      //   token,
      //   amount: amountInCents,
      //   parkingSessionId: vehicleId
      // });

      // if (squareResponse.data.success) {
      //   console.log("Square payment successful:", squareResponse.data.payment);

      //   console.log('Recording parking payment for vid', vehicleId);
      //   await axios.post("/payments/record-parking", {
      //     state: {
      //       vehicleId: vehicleId,
      //       checkin: vehicle.checkin,
      //       checkout: vehicle.checkout
      //     }
      //   });

      console.log("Payment recorded successfully. Updating vehicle status...");
      await axios.put(`/vehicles/payment/${vehicleId}`, {
        state: {
          requires_payment: 2
        }
      });

      setModal({
        isOpen: true,
        type: "alert",
        title: "Payment Successful",
        message: `Payment of $${totalAmount.toFixed(2)} processed successfully!`,
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
      //  }
    } catch (error) {
      console.error("Error processing payment:", error);
      setModal({
        isOpen: true,
        type: "alert",
        title: "Payment Failed",
        message: error.response?.data?.message || error.message || "Payment processing failed",
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
        }
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
            {squareError && (
              <div style={{ backgroundColor: "#ffebee", border: "1px solid #f44336", color: "#c62828", padding: "10px", borderRadius: "4px", marginBottom: "15px" }}>
                {squareError}
              </div>
            )}
            {cardError && (
              <div style={{ backgroundColor: "#ffebee", border: "1px solid #f44336", color: "#c62828", padding: "10px", borderRadius: "4px", marginBottom: "15px" }}>
                {cardError}
              </div>
            )}

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
            <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "white", borderRadius: "4px", border: "1px solid #ddd" }}>
              <h4 style={{ marginTop: 0, marginBottom: "15px" }}>Credit Card Information</h4>
              <div ref={cardRef} style={{ minHeight: "56px", marginBottom: "15px" }} className="sq-card" />
              {cardLoading && <p style={{ color: "#666", fontSize: "12px" }}>Loading card form...</p>}
            </div>
            <div style={{ marginTop: "20px" }}>
              <h4 style={{ marginTop: 0, marginBottom: "15px" }}>Test Credit Card Info:</h4>
              <div>Card: 4111 1111 1111 1111</div>
              <div>Exp: 12/26</div>
              <div>CVV: 111</div>
              <div>Zip: 12345</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
              <button
                className="standardsubmitbutton"
                onClick={handlePayment}
                disabled={loading || cardLoading || !payments}

              >
                {loading ? "Processing..." : "Pay"}
              </button>
              <div>${(pricePerNight * numdays).toFixed(2)}</div>
              <button className="standardcancelbutton" onClick={() => navigate(-1)}>Cancel</button>
            </div>
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
