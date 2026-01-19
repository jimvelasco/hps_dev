import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";

export default function HoaSelector() {
  const navigate = useNavigate();
  const [hoas, setHoas] = useState([]);
  const [selectedHoaId, setSelectedHoaId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHoas = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/hoas");
        // let tary = [];
        // tary.push(response.data)
        //setHoas(tary);
         setHoas(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load HOAs");
        console.error("Error fetching HOAs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHoas();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedHoaId) {
      navigate(`/${selectedHoaId}`);
    }
  };

  //https://hoaparking.s3.us-east-1.amazonaws.com/timber_run.jpg
  //https://hoaparking.s3.us-east-1.amazonaws.com/Rockies-Condominiums-08.jpg
  //http://hoaparking.s3.amazonaws.com/yampa_103022.jpg
  return (
    <div style={{
      backgroundImage: "url('http://hoaparking.s3.amazonaws.com/steamboat-ski-resort.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      minHeight: "100vh",
      padding: "20px",
      backgroundColor: "#f5f5f5"
    }}>
      <div className="standardtitlebar">
        <h1 style={{ fontSize: "24px" }}>HOA Parking Solutions</h1>
      </div>

      <div style={{
        marginTop: "50px",
        width: "300px",
        margin: "50px auto",
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "30px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
      }}>
        <h2 style={{ color: "#1976d2", textAlign: "center", marginTop: 0 }}>
          Welcome
        </h2>
        <p style={{ textAlign: "center", color: "#666", fontSize: "16px" }}>
          Select your HOA to get started
        </p>

        {error && (
          <div className="displayerror" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: "center", color: "#666" }}>Loading HOAs...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: "bold",
                color: "#333"
              }}>
                Select your HOA
              </label>
              <select
                value={selectedHoaId}
                onChange={(e) => setSelectedHoaId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
                required
              >
                <option value="">-- Select an HOA --</option>
                {hoas.map((hoa) => (
                  <option key={hoa._id} value={hoa.hoaid}>
                    {hoa.name}
                  </option>
                ))}
              </select>
            </div>

            {/* <button
              type="submit"
              className="standardsubmitbutton"
              disabled={!selectedHoaId}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                cursor: selectedHoaId ? "pointer" : "not-allowed",
                opacity: selectedHoaId ? 1 : 0.6
              }}
            >
              Continue
            </button> */}
            <div className="button-grid">
              <button className="btn btn-primary"
                type="submit"
                disabled={!selectedHoaId}
                style={{
                  maxWidth: '100%',
                  cursor: selectedHoaId ? "pointer" : "not-allowed",
                  opacity: selectedHoaId ? 1 : 0.6
                }
                }

              >
                Continue
              </button>
              
            </div>
            <div className="button-grid" style={{ marginTop: "15px" }}>
              <button
                type="button"
                className="btnxs btn-primary"
                onClick={() => navigate("/about")}
              >
                About
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
