import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../services/api";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import { useLoggedInUser } from "../hooks/useLoggedInUser";
import DashboardNavbar from "../components/DashboardNavbar";
import ModalAlert from "../components/ModalAlert";

export default function UserProfile() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, error: hoaError } = useHoa();
  const { setAppError } = useError();
  const { user: loggedInUser, loading: userLoading } = useLoggedInUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
    onConfirm: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    pincode: "",
    renter_free_parking: "",
    owner_free_parking: "",
    password: "",
    passwordConfirm: ""
  });
 // console.log("UserProfile userLoading:", userLoading);
 // console.log("UserProfile loggedInUser:", loggedInUser);

  useEffect(() => {
    if (!userLoading && loggedInUser) {
      const fetchUserData = async () => {
        
        try {
          setLoading(true);
         //  console.log("UserProfile fetchUserData: getting users/me");
          const response = await axios.get("/users/me");
          setFormData({
            first_name: response.data.first_name || "",
            last_name: response.data.last_name || "",
            phone: response.data.phone || "",
            email: response.data.email || "",
            pincode: response.data.pincode || "",
            renter_free_parking: response.data.renter_free_parking || "",
            owner_free_parking: response.data.owner_free_parking || "",
            password: "",
            passwordConfirm: ""
          });
        } catch (err) {
          setError(err.response?.data?.message || err.message || "Failed to fetch user profile");
          console.error("Error fetching user profile:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }
  }, [userLoading, loggedInUser]);

  if (userLoading || loading) {
    return <div style={{ padding: "20px" }}>Loading profile...</div>;
  }

  if (hoaError) {
    setAppError(hoaError);
    navigate(`/${hoaId}/error`);
    return null;
  }

  if (!loggedInUser) {
    navigate(`/${hoaId}/dashboard`);
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name || !formData.phone || !formData.email) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: "Please fill in all required fields (first name, last name, phone, email)",
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
        }
      });
      return;
    }

    if (formData.password && formData.password !== formData.passwordConfirm) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: "Passwords do not match",
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
        }
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        email: formData.email,
        pincode: formData.pincode,
        renter_free_parking: formData.renter_free_parking ? parseInt(formData.renter_free_parking) : 1,
        owner_free_parking: formData.owner_free_parking ? parseInt(formData.owner_free_parking) : 1
      };

      if (formData.password) {
        submitData.password = formData.password;
      }

      const response = await axios.put(`/users/${loggedInUser._id}`, submitData);

      if (response.status === 200) {
        setModal({
          isOpen: true,
          type: "alert",
          title: "Success",
          message: "Profile updated successfully",
          confirmText: "OK",
          onConfirm: () => {
            setModal(prev => ({ ...prev, isOpen: false }));
            navigate(`/${hoaId}/dashboard`);
          }
        });
      }
    } catch (err) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: `Error: ${err.response?.data?.message || err.message}`,
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToDashboard = () => {
    // navigate(`/${hoaId}/dashboard`);
    navigate(-1);
  };

  const navButtons = [
    {
      label: "Back",
      onClick: handleBackToDashboard,
      color: "#1976d2",
      hoverColor: "#1565c0"
    }
  ];

  let backgroundImage = '';
  if (hoa) {
    backgroundImage = hoa.background_image_url;
  }
  if (loggedInUser && loggedInUser.role === 'admin') {
    console.log('Admin User');
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      backgroundImage: `url('${backgroundImage}')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      <DashboardNavbar title="User Profile" buttons={navButtons} />

      <div style={{ padding: "30px", maxWidth: "600px", margin: "0 auto" }}>
        {error && (
          <div style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "15px",
            borderRadius: "4px",
            marginBottom: "20px",
            border: "1px solid #f5c6cb"
          }}>
            {error}
          </div>
        )}

        <div style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>
          <h2 style={{ color: "#1976d2", marginTop: 0 }}>Edit Your Profile</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label className="input-label">
                First Name *
              </label>
              <input
                className="standardinput"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Last Name *
              </label>
              <input
                className="standardinput"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Phone *
              </label>
              <input
                className="standardinput"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: "#f5f5f5"
                }}
              />
            </div>


{(loggedInUser && loggedInUser.role !== 'admin') && ( 



<>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                PIN Code
              </label>
              <input
                className="standardinput"
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Owner Free Parking
              </label>
              <input
                className="standardinput"
                type="number"
                name="owner_free_parking"
                value={formData.owner_free_parking}
                onChange={handleInputChange}
              />
            </div>
             <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Renter Free Parking
              </label>
              <input
                className="standardinput"
                type="number"
                name="renter_free_parking"
                value={formData.renter_free_parking}
                onChange={handleInputChange}
              />
            </div>
            </>

)
}


            <div style={{ marginBottom: "15px", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
              <h3 style={{ color: "#1976d2", marginBottom: "15px" }}>Change Password (Optional)</h3>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current password"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleInputChange}
                  placeholder="Re-enter new password"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <div className="button-grid">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ opacity: isSubmitting ? 0.6 : 1 }}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
              <button  className="btn btn-default"
                type="button"
                onClick={handleBackToDashboard}
               
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <ModalAlert
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.confirmText}
        onConfirm={modal.onConfirm}
      />
    </div>
  );
}
