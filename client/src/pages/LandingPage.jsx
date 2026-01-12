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
      <div className="xtableview">
        <div className="standardtitlebar">
          <h2 onClick={() => navigate("/")}>HOA Parking Solutions</h2>
        </div>
      </div>
      {/* <div className="phoneview">
        <div className="standardtitlebar">
          <h2 onClick={() => navigate("/")}>HOA<br />Parking<br />Solutions</h2>
        </div>
      </div> */}

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
        <>
        <div style={{margin:"0px auto", textAlign:"center",border:"0px solid black",
          padding:"4px",maxWidth:"360px", backgroundColor: "#fff",
          borderRadius: "8px", padding: "10px", opacity: ".8"}}>
        <div className="button-grid">
              <button
             className="btn btn-primary"
             onClick={() => navigate(`/${hoaId}/ownerslogin`)}
           >
             Owners
           </button>
           <button
             className="btn btn-primary"
             onClick={() => navigate(`/${hoaId}/renterslogin`)}
           >
             Renters
           </button>
        </div>
        </div>
        {/* <div style={{
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
        </div> */}
        </>
      )}
    </div>
  );
}
