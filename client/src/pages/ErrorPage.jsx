import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useError } from "../context/ErrorContext";
import { useHoa } from "../context/HoaContext";
import { getAWSResource } from "../utils/awsHelper";

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
    // navigate(hoaId ? `/${hoaId}` : "/");
     navigate(-1);
  };

  let backgroundImage = '';
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
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

        <div className="page-content error-page-content">
      <div style={{
          backgroundColor: "#ffffff",
          margin: "auto",
          padding: "20px",
          maxWidth: "340px",
          textAlign: "center",
           borderRadius: "8px",
            opacity: "0.9"
        }}>
          <h1 style={{ color: "#d32f2f", marginBottom: "20px",marginTop: "0px" }}>
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

          {/* <div style={{ display: "flex", gap: "10px", justifyContent: "center"}}> */}
          <div className="button-grid">
            <button className="btn btn-primary"
              onClick={handleGoBack}
            >
              Back
            </button>

            <button className="btn btn-primary"
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
