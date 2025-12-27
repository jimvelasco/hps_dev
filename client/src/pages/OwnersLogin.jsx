import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import ForgotPasswordDialog from "../components/ForgotPasswordDialog";

export default function OwnersLogin() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const [email, setEmail] = useState("jim.velasco@gmail.com");
  // const [email, setEmail] = useState("admin@retreatia.com");
  const [password, setPassword] = useState("123456");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);

  useEffect(() => {
    localStorage.removeItem("token");
  }, []);

  useEffect(() => {
    if (hoaId) {
      fetchHoaById(hoaId).catch((err) => {
        setAppError(err.message || "Failed to load HOA data");
        navigate(`/${hoaId}/error`);
      });
    }
  }, [hoaId, fetchHoaById, setAppError, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setAppError("Email and password are required");
      navigate(`/${hoaId}/error`);
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await axios.post("/users/login", {
        email,
        password
      });

      if (response.status === 200 && response.data.token) {
        console.log("Login successful");
        localStorage.setItem("token", response.data.token);
        navigate(`/${hoaId}/dashboard`);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Login failed";
      setAppError(errorMessage);
      navigate(`/${hoaId}/error`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return <div>Loading HOA data...</div>;
  }

  if (error) {
    setAppError(error);
    navigate(`/${hoaId}/error`);
    return null;
  }

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
      padding: "20px"
    }}>
      <div className="standardtitlebar">
        <h1 style={{ fontSize: "24px" }}>HOA Parking Solutions</h1>
      </div>

      <div className="loginboxes">
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", border: "0px solid black"
        }}>
          <h2>Owner Login</h2>
          {/* <button className="windowclosebutton"
            onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faXmark} />
          </button> */}
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Email
            </label>
            <input className="standardinput"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="password" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Password
            </label>
            <input className="standardinput"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <div style={{ marginTop: "8px", textAlign: "right" }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowForgotPasswordDialog(true);
                }}
                style={{ color: "#1976d2", textDecoration: "underline", fontSize: "14px", cursor: "pointer" }}
              >
                Forgot Password?
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: "space-between" }}>

            <button className="standardsubmitbutton"
              type="submit"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Logging in..." : "Submit"}
            </button>
            <button className="standardcancelbutton"
              type="button"
              disabled={isLoggingIn}
              onClick={() => navigate(-1)}
            >
              {isLoggingIn ? "Logging in..." : "Cancel"}
            </button>
          </div>
        </form>
        {/* 
        {hoa && (
          <div style={{ marginTop: "30px", padding: "15px", border: "1px solid #000000", borderRadius: "5px", backgroundColor: "#f5f5f5" }}>
            <p><strong>HOA ID:</strong> {hoa.hoaid}</p>
            <p><strong>HOA Name:</strong> {hoa.name}</p>
          </div>
        )} */}
      </div>

      <ForgotPasswordDialog
        isOpen={showForgotPasswordDialog}
        hoaId={hoaId}
        onClose={() => setShowForgotPasswordDialog(false)}
      />
    </div>
  );
}
