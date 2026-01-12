import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../services/api";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import DashboardNavbar from "../components/DashboardNavbar";
import ModalAlert from "../components/ModalAlert";
import { getAWSResource } from "../utils/awsHelper";


export default function UserDetails() {
  const { hoaId, userId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading: hoaLoading, error: hoaError, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const [loading, setLoading] = useState(userId ? true : false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null, onCancel: null });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    unitnumber: "",
    bedrooms: "",
    role: "",
    inventory_allowed_owner: "",
    parking_allowed_renter: "",
    owner_free_parking: "",
    renter_free_parking: "",
    pincode: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/users/${userId}`);
          setFormData({
            first_name: response.data.first_name || "",
            last_name: response.data.last_name || "",
            phone: response.data.phone || "",
            email: response.data.email || "",
            password: response.data.password || "",
            unitnumber: response.data.unitnumber || "",
            bedrooms: response.data.bedrooms || "",
            role: response.data.role || "",
            inventory_allowed_owner: response.data.inventory_allowed_owner || "",
            parking_allowed_owner: response.data.parking_allowed_owner || "",
            parking_allowed_renter: response.data.parking_allowed_renter || "",
            owner_free_parking: response.data.owner_free_parking || "",
            renter_free_parking: response.data.renter_free_parking || "",
            pincode: response.data.pincode || ""
          });
        } catch (err) {
          setError(err.response?.data?.message || err.message || "Failed to fetch user");
          console.error("Error fetching user:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else if (hoa && !userId) {
      setFormData(prev => ({
        ...prev,
        inventory_allowed_owner: hoa.inventory_allowed_owner || "",
        parking_allowed_owner: hoa.parking_allowed_owner || "",
        parking_allowed_renter: hoa.parking_allowed_renter || "",
        owner_free_parking: hoa.owner_free_parking_spots || "",
        renter_free_parking: hoa.renter_free_parking_spots || ""
      }));
    }
  }, [userId, hoa]);

  if (hoaLoading) {
    return <div style={{ padding: "20px" }}>Loading HOA data...</div>;
  }

  if (hoaError) {
    setAppError(hoaError);
    navigate(`/${hoaId}/error`);
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
          setModal(prev => ({ ...prev, isOpen: false }))
        }
      });
      return;
    }

    if (!isEditMode && !formData.password) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: "Password is required",
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }))
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
        unitnumber: formData.unitnumber,
        password: formData.password,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        role: formData.role,
        pincode: formData.pincode,
        inventory_allowed_owner: formData.inventory_allowed_owner ? parseInt(formData.inventory_allowed_owner) : undefined,
        parking_allowed_renter: formData.parking_allowed_renter ? parseInt(formData.parking_allowed_renter) : undefined,
        parking_allowed_owner: formData.parking_allowed_owner ? parseInt(formData.parking_allowed_owner) : undefined,
        owner_free_parking: formData.owner_free_parking ? parseInt(formData.owner_free_parking) : undefined,
        renter_free_parking: formData.renter_free_parking ? parseInt(formData.renter_free_parking) : undefined
      };

      // if (!isEditMode) {. i will put this back in later instead of always like above?
       //  submitData.password = formData.password;
      // }

      if (userId) {
        const response = await axios.put(`/users/${userId}`, submitData);
        // alert(`User updated successfully: ${response.data.user.first_name} ${response.data.user.last_name}`);
        //console.log("***** opening modal User update response:", response);
        if (response.status === 200) {
          setModal({
            isOpen: true,
            type: "alert",
            title: "Success",
            message: `User updated successfully: ${response.data.user.first_name} ${response.data.user.last_name}`,
            confirmText: "OK",
            onConfirm: () => {
              setModal(prev => ({ ...prev, isOpen: false }))
              navigate(`/${hoaId}/users`);
            }
          });
        }




      } else {
        const response = await axios.post("/users", {
          ...submitData,
          hoaid: hoaId
        });
        // alert(`User created successfully: ${response.data.user.first_name} ${response.data.user.last_name}`);
        // navigate(`/${hoaId}/users`);
        setModal({
          isOpen: true,
          type: "alert",
          title: "Success",
          message: `User created successfully: ${response.data.user.first_name} ${response.data.user.last_name}`,
          confirmText: "OK",
          onConfirm: () => {
            setModal(prev => ({ ...prev, isOpen: false }))
            navigate(`/${hoaId}/users`);
          }
        });
      }
      //   navigate(`/${hoaId}/users`);
    } catch (err) {
      //  alert(`Error: ${err.response?.data?.message || err.message}`);
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: `Error: ${err.response?.data?.message || err.message}`,
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }))
        }
      });
      //   console.error("Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToUsers = () => {
    navigate(`/${hoaId}/users`);
  };

  const handleDelete = async () => {
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Confirm Delete",
      message: `Are you sure you want to delete ${formData.first_name} ${formData.last_name}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        setModal(prev => ({ ...prev, isOpen: false }));
        setIsSubmitting(true);
        try {
          await axios.delete(`/users/${userId}`);
          setModal({
            isOpen: true,
            type: "alert",
            title: "Success",
            message: "User deleted successfully",
            confirmText: "OK",
            onConfirm: () => {
              setModal(prev => ({ ...prev, isOpen: false }));
              navigate(`/${hoaId}/users`);
            }
          });
        } catch (err) {
          setModal({
            isOpen: true,
            type: "alert",
            title: "Error",
            message: err.response?.data?.message || err.message || "Failed to delete user",
            confirmText: "OK",
            onConfirm: () => {
              setModal(prev => ({ ...prev, isOpen: false }));
            }
          });
        } finally {
          setIsSubmitting(false);
        }
      },
      onCancel: () => {
        setModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const navButtons = [
    {
      label: "Back",
      onClick: handleBackToUsers,
      color: "#1976d2",
      hoverColor: "#1565c0"
    }
  ];

  let backgroundImage = '';
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
  }
  const isEditMode = !!userId;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <DashboardNavbar title={isEditMode ? "Edit User" : "Create User"} buttons={navButtons} />

      <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
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

        {loading ? (
          <p style={{ color: "#666" }}>Loading user data...</p>
        ) : (
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
          }}>
            <h2 style={{ color: "#1976d2", marginTop: 0 }}>
              {isEditMode ? "Edit User" : "Create New User"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label className="input-label"
                >
                  First Name *
                </label>
                <input className="standardinput"
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
                <input className="standardinput"
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
                <input className="standardinput"
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
                  disabled={isEditMode}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: isEditMode ? "#f5f5f5" : "white"
                  }}
                />
              </div>

              {/* {!isEditMode && ( we have this so I can change pws*/}
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
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
              {/* )} */}

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Unit Number
                </label>
                <input className="standardinput"
                  type="text"
                  name="unitnumber"
                  value={formData.unitnumber}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Bedrooms
                </label>
                <input className="standardinput"
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Role
                </label>
                <input className="standardinput"
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="e.g., admin, owner, renter"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  PIN Code
                </label>
                <input className="standardinput"
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Inventory Allowed
                </label>
                <input className="standardinput"
                  type="number"
                  name="inventory_allowed_owner"
                  value={formData.inventory_allowed_owner}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Owner Parking Allowed
                </label>
                <input className="standardinput"
                  type="number"
                  name="parking_allowed_owner"
                  value={formData.parking_allowed_owner}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Renter Parking Allowed
                </label>
                <input className="standardinput"
                  type="number"
                  name="parking_allowed_renter"
                  value={formData.parking_allowed_renter}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Owner Free Parking
                </label>
                <input className="standardinput"
                  type="number"
                  name="owner_free_parking"
                  value={formData.owner_free_parking}
                  onChange={handleInputChange}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Renter Free Parking
                </label>
                <input className="standardinput"
                  type="number"
                  name="renter_free_parking"
                  value={formData.renter_free_parking}
                  onChange={handleInputChange}
                />
              </div>


               <div className="button-grid">
                <button className="btn btn-primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : isEditMode ? "Update User" : "Create User"}
                </button>

                <button className="btn btn-default"
                 
                  onClick={handleBackToUsers}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                {isEditMode && (
                  <button className="btn btn-danger"
                    
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    Delete
                  </button>
                )}
              </div>



              {/* <div style={{ display: "flex", gap: "10px" }}>
                <button className="standardsubmitbutton180"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : isEditMode ? "Update User" : "Create User"}
                </button>
                <button className="standardcancelbutton180"
                  type="button"
                  onClick={handleBackToUsers}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                {isEditMode && (
                 
                   <button className="standarddeletebutton180"
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                   
                  >
                    {isSubmitting ? "Deleting..." : "Delete User"}
                  </button>
                )}
              </div> */}










            </form>
          </div>
        )}
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
  );
}

/* 
the user profile can change the following
first_name
last_name
phone
email
password need a confirm field so they match
pincode
renter_free_parking
unit not available for rent
unitnumber is not editable
*/
