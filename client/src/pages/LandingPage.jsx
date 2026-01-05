import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage({ backgroundImage, hoaId, hoaError }) {
  const navigate = useNavigate();

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
            <div>We have a problem with your Hoa Id in the URL.</div>
            <div>Please check that you entered it correctly</div>
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
          marginTop: "30px",
          width: "350px",
          margin: "auto",
          backgroundColor: "#fff",
          borderRadius: "8px",
          border: "0px solid #000000",
          padding: "10px",
          display: "flex",
          justifyContent: "space-evenly",
          opacity: ".8"
        }}>
          <button
            className="standardsubmitbutton"
            onClick={() => navigate(`/${hoaId}/ownerslogin`)}
          >
            Owners
          </button>
          <button
            className="standardsubmitbutton"
            onClick={() => navigate(`/${hoaId}/renterslogin`)}
          >
            Renters
          </button>
        </div>
      )}
    </div>
  );
}
