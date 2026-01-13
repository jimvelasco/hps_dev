import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import { useLoggedInUser } from "../hooks/useLoggedInUser";
import DashboardNavbar from "../components/DashboardNavbar";
import "../styles/global.css";
import { getAWSResource } from "../utils/awsHelper";

export default function TermsAndConditions() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading: hoaLoading, error: hoaError, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const { user: loggedInUser, loading: userLoading } = useLoggedInUser();
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { role } = location.state || {};

  useEffect(() => {
    if (hoaId) {
      fetchHoaById(hoaId).catch((err) => {
        setAppError(err.message || "Failed to load HOA data");
        navigate(`/${hoaId}/error`);
      });
    }
  }, [hoaId, fetchHoaById, setAppError, navigate]);

  useEffect(() => {
    if (!hoaLoading && !userLoading) {
      setLoading(false);
    }
  }, [hoaLoading, userLoading]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const navButtons = [
    {
      label: "Back",
      onClick: handleBackClick,
      which: "goback"
    }
  ];

  let backgroundImage = '';
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
  }

  // const userRole = loggedInUser?.role || null;
  const userRole = role

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <DashboardNavbar title="Terms and Conditions" buttons={navButtons} />
        <div className="ajaxloader">
          <p style={{ color: "#666" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (hoaError) {
    setAppError(hoaError);
    navigate(`/${hoaId}/error`);
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <DashboardNavbar title="Terms and Conditions" buttons={navButtons} />


      {/* <embed src="https://hoaparking.s3.us-east-1.amazonaws.com/YV/YV-Terms_and_Conditions.pdf" 
       type="application/pdf" width="100%" height="600px" /> */}

      <div className="page-content">
        <div style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>
          {userRole === "owner" ? (
            // <embed src={`${getAWSResource(hoa, 'OTC')}`} type="application/pdf" width="100%" height="600px" />
            <>
              <iframe
                src={`${getAWSResource(hoa, 'OTC')}`}
                type="application/pdf"
                width="100%"
                height="600px"
              />
              <a
                href={`${getAWSResource(hoa, 'OTC')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download PDF
              </a>
            </>

          ) : (
            <>
            <iframe
              src={`${getAWSResource(hoa, 'RTC')}`}
              type="application/pdf"
              width="100%"
              height="600px"
            />
            <a
                href={`${getAWSResource(hoa, 'RTC')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download PDF
              </a>
            </>
            // <embed src={`${getAWSResource(hoa, 'RTC')}`} type="application/pdf" width="100%" height="600px" />
          )}


        </div>
      </div>


    </div>
  );
}
