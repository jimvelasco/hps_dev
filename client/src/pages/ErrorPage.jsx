import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useError } from "../context/ErrorContext";
import { useHoa } from "../context/HoaContext";

export default function ErrorPage() {
  const navigate = useNavigate();
  const { hoaId } = useParams();
  const { error, clearError } = useError();
  const { hoa, loading, error: hoaError, fetchHoaById } = useHoa();

  const handleGoBack = () => {
    // console.log("handle go backNavigating to home for hoaId:", hoaId);
    clearError();
    navigate(-1);
  };

  const handleGoHome = () => {
    clearError();
    //hoaId = "YV"
    // console.log("handle go home Navigating to home for hoaId:", hoaId);
    navigate(hoaId ? `/${hoaId}` : "/");
  };

  let backgroundImage = '';
  if (hoa) {
    backgroundImage = hoa.background_image_url;
  }



  if (!hoa) {
    return null
  } else {
    return (
      <div style={{
        minHeight: "100vh", backgroundColor: "#f5f5f5",
        backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover",
        backgroundPosition: "center", backgroundAttachment: "fixed"
      }}>

        <div className="page-content">
      <div style={{
          backgroundColor: "#f0f0f0",
         
          margin: "40px auto",
          padding: "20px",
          maxWidth: "400px",
          // boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          textAlign: "center",
           borderRadius: "8px",
            opacity: "0.9"
        }}>
          <h1 style={{ color: "#d32f2f", marginBottom: "20px",marginTop: "0" }}>
            ⚠️ Error
          </h1>

          <div style={{
            backgroundColor: "#ffebee",
            border: "1px solid #ef5350",
            borderRadius: "4px",
            padding: "20px",
            marginBottom: "30px",
            textAlign: "left",
           
          }}>
            <p 
            style={{
              color: "#c62828",
              fontSize: "16px",
            //  fontFamily: "monospace",
           //   whiteSpace: "pre-wrap",
            //  wordBreak: "break-word",
              margin: 0
            }}
            >
              {error || "An unknown error occurred"}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center"}}>
            <button className="standardsubmitbutton"
              onClick={handleGoBack}
              // style={{
              //   padding: "10px 20px",
              //   fontSize: "16px",
              //   backgroundColor: "#1976d2",
              //   color: "white",
              //   border: "none",
              //   borderRadius: "4px",
              //   cursor: "pointer",
              //   transition: "background-color 0.3s"
              // }}
              // onMouseOver={(e) => e.target.style.backgroundColor = "#1565c0"}
              // onMouseOut={(e) => e.target.style.backgroundColor = "#1976d2"}
            >
              Go Back
            </button>

            <button className="standardcancelbutton"
              onClick={handleGoHome}
             
            >
              Home
            </button>
          </div>
        </div>
      </div>
     </div >
  );
  }
}
