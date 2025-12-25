import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../services/api";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import DashboardNavbar from "../components/DashboardNavbar";
import ModalAlert from "../components/ModalAlert";


export default function ParkingPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { vehicleId, unitNumber, hoaId } = location.state;
  const [loading, setLoading] = useState(false);
  const { hoa, loading: hoaLoading, error: hoaError, fetchHoaById } = useHoa();
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null, onCancel: null });
  const [vehicle, setVehicle] = useState(null);
  const [numdays, setNumdays] = useState(0);
  const [error, setError] = useState(null);
  const [pricePerNight, setPricePerNight] = useState(0);


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
      // Process payment with Stripe/PayPal
      // Then record the payment:
      const response = await axios.post("/payments/record-parking", {
        state: {
          vehicleId: vehicleId,
        },
      });

      if (response.status === 200) {
        console.log("Payment recorded successfully. setting sessionStorage");
        // sessionStorage.setItem("parkingPaymentComplete", "true");
        // sessionStorage.setItem("paidForSpot", spotNumber);


        await axios.put(`/vehicles/payment/${vehicleId}`, {
          state: {
            requires_payment: 2
          }
        });
        if (response.status === 200) {
          setModal({
            isOpen: true,
            type: "alert",
            title: "Payment Successful",
            message: "Payment processing success",
            confirmText: "OK",
            onConfirm: () => {
              setModal(prev => ({ ...prev, isOpen: false }))
              navigate(`/${hoaId}/rentervehicles/${unitNumber}`);
            }
          });
        }

      }
    } catch (error) {
      console.error("Payment failed:", error);
      setModal({
        isOpen: true,
        type: "alert",
        title: "Payment Failed",
        message: error.response?.data?.message || "Payment processing failed",
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
    backgroundImage = hoa.background_image_url;
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
        <div className="standardtitlebar">
          <h1>Parking Space Payment</h1>
        </div>
        <div style={{
          backgroundColor: "f0f0f0",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>



          <div style={{ backgroundColor: "#f0f0f0", padding: "20px", borderRadius: "8px" }}>
            <p>Unit {unitNumber} - Adding Vehicle #{vehicleId}</p>
            <h3>Pricing Breakdown</h3>
            <p>Name: <strong>{vehicle.carowner_fname} {vehicle.carowner_lname} </strong></p>
            <p>Make <strong>{vehicle.make}</strong></p>
            <p>Model: <strong>{vehicle.model}</strong></p>
            <p>Year: <strong>{vehicle.year}</strong></p>
            <p>License Plate: <strong>{vehicle.plate}</strong></p>
            <p>Start Date: <strong>{vehicle.startdate}</strong></p>
            <p>End Date: <strong>{vehicle.enddate}</strong></p>
            <p>Days: <strong>{numdays}</strong></p>
            <p>Price per Night: <strong>${pricePerNight.toFixed(2)}</strong></p>
            <p>Total Price: <strong>${(pricePerNight * numdays).toFixed(2)}</strong></p>
            <button className="standardsubmitbutton"
              onClick={handlePayment}
              disabled={loading}
              style={{ marginTop: "20px", marginRight: "10px", padding: "10px 20px" }}
            >Submit
            </button>
            <button className="standardcancelbutton" onClick={() => navigate(-1)}>Cancel</button>

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
