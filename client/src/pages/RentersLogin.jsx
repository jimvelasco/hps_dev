import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";

export default function RentersLogin() {
    const { hoaId } = useParams();
    const navigate = useNavigate();
    const { hoa, loading, error, fetchHoaById } = useHoa();
    const { setAppError } = useError();
    const [units, setUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState("111");
    const [pin, setPin] = useState("111");
    const [loadingUnits, setLoadingUnits] = useState(false);

     useEffect(() => {
        localStorage.removeItem("token");
       // console.log("RentersLogin component mounted");
        
      }, []);

    useEffect(() => {
        if (hoaId) {
           // console.log("renters.jsx Fetching HOA data for ID:", hoaId);
            fetchHoaById(hoaId).catch((err) => {
                setAppError(err.message || "Failed to load HOA data");
                navigate("/error");
            });
        }
    }, [hoaId, fetchHoaById, setAppError, navigate]);

    useEffect(() => {
        if (hoaId) {
            fetchUnits(hoaId);
        }
    }, [hoaId]);

    const fetchUnits = async (hoaId) => {
        setLoadingUnits(true);
        try {
            const response = await axios.get("/users", { params: { hoaid: hoaId } });
            const unitNumbers = response.data
                .filter(user => user.unitnumber)
                .map(user => ({ id: user._id, unitnumber: user.unitnumber }));
            setUnits(unitNumbers);
        } catch (err) {
           // console.error("Error fetching units:", err);
            setAppError("Failed to load unit numbers");
             navigate(`/${hoaId}/error`);
        } finally {
            setLoadingUnits(false);
        }
    };

    /*     */
    const handleSubmit = async (e) => {
      //  console.log("handleSubmit called in renterslogin.jsx");
        e.preventDefault();
         if (!selectedUnit || !pin) {
            setAppError("Please select a unit and enter a pin");
             navigate(`/${hoaId}/error`);
            return;
        }
        try {
            const response = await axios.post(`/users/renters/verify-pin`, {
                hoaId,
                unitNumber: selectedUnit,
                pinCode: pin
            });

            // Store the token
            localStorage.setItem("token", response.data.token);

            // Navigate to renter vehicles
            navigate(`/${hoaId}/rentervehicles/${selectedUnit}`);
        } catch (err) {
            setAppError(err.response?.data?.message || "Invalid PIN");
           // navigate("/error");
             navigate(`/${hoaId}/error`);
        }
    };


    /*
    */


    if (loading) {
        return <div style={{ padding: "20px" }}>Loading HOA data...</div>;
    }

    if (error) {
        setAppError(error);
        navigate("/error");
        return null;
    }

    const handleCancelClick = () => {
        navigate(`/${hoaId}`);
        // navigate(-1);
    };
    let backgroundImage = '';
    if (hoa) {
        backgroundImage = hoa.background_image_url;
    }


    return (
        <div style={{
            backgroundImage: `url('${backgroundImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            minHeight: "100vh",
            padding: "20px",

        }}>
            <div className="standardtitlebar">
                <h1 style={{ fontSize: "24px" }}>HOA Parking Solutions</h1>
            </div>

            <div className="loginboxes">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "0px solid black" }}>
                    <h2>Renters</h2>
                    {/* <button className="windowclosebutton "
                        onClick={() => navigate(-1)}
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button> */}
                </div>

                {loadingUnits ? (
                    <p>Loading units...</p>
                ) : (
                    <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                        <div style={{ marginBottom: "15px" }}>
                            <label htmlFor="unit" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                                Unit Number
                            </label>
                            <select className="standardselect100"
                                id="unit"
                                value={selectedUnit}
                                // onChange={(e) => setSelectedUnit(e.target.value)}
                                onChange={(e) => setSelectedUnit(e.target.value)}

                                required
                            >
                                <option value="">-- Select a unit --</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.unitnumber}>
                                        {unit.unitnumber}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label htmlFor="pin" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                                PIN Code
                            </label>
                            <input className="standardinput"
                                id="pin"
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}

                                required
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: "space-between" }}>

                            <button className="standardsubmitbutton"
                                type="submit"
                            >
                                Submit
                            </button>
                            <button className="standardcancelbutton"
                                type="button"
                                // onClick={() => navigate(-1)}
                                onClick={handleCancelClick}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>





        </div>
    );
}


//  style={{
//                                 // width: "100%",
//                                 padding: "12px",
//                                 backgroundColor: "#007bff",
//                                 color: "white",
//                                 border: "none",
//                                 borderRadius: "4px",
//                                 fontSize: "16px",
//                                 cursor: "pointer",
//                                 fontWeight: "bold"
//                             }}
//                             onMouseOver={(e) => {
//                                 e.target.style.backgroundColor = "#0056b3";
//                             }}
//                             onMouseOut={(e) => {
//                                 e.target.style.backgroundColor = "#007bff";
//                             }}
