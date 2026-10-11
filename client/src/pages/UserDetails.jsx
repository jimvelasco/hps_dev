import React, { useEffect, useState } from "react";
import { useParams, useNavigate ,useLocation} from "react-router-dom";
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
   const location = useLocation();
  const { numonunit, homeownersid, which,lastname } = location.state ?? {};
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null, onCancel: null });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    unitnumber: "",
    role: "owner",
    handicapped: false,
    hoaid: "",
    password: "",
    
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
            unitnumber: response.data.unitnumber || "",
            role: response.data.role || "",
            handicapped: response.data.handicapped ?? false,
            hoaid: response.data.hoaid || "",
             password: response.data.password || "",

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
       console.log('we are creating a new user',location.state)
      setFormData(prev => ({
        ...prev,
        // inventory_allowed_owner: hoa.inventory_allowed_owner || "",
        // parking_allowed_owner: hoa.parking_allowed_owner || "",
        // parking_allowed_renter: hoa.parking_allowed_renter || "",
        // owner_free_parking: hoa.owner_free_parking_spots || "",
        // renter_free_parking: hoa.renter_free_parking_spots || ""
       

        first_name: prev.first_name || "",
        last_name: lastname || prev.last_name || "",
        phone: prev.phone || "",
        email: prev.email || "",
        unitnumber:  numonunit || prev.unitnumber || "",
        hoaid: prev.hoaid || "",
        role: "owner",
        password: ""
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('THE FORM DATA IS ',formData)

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
        role: formData.role,
        handicapped: formData.handicapped,
        hoaid: formData.hoaid,
        password: formData.password,
      };

    //  console.log('user detail submit data is ', submitData);

      if (userId) {
        const response = await axios.put(`/users/${userId}`, submitData);
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
    } catch (err) {
      let serverResponse = err.response.data;
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: `Error: ${serverResponse.errors?.[0]?.message || serverResponse.message || err.message}`,
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

  // message: `Error: ${err.response?.data?.message || err.message}`,

  const handleBackToUsers = () => {
    //navigate(`/${hoaId}/users`);
     navigate(-1);
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
          const response = await axios.delete(`/users/${userId}`);
          setModal({
            isOpen: true,
            type: "alert",
            title: "Success",
            message: response.data.message,
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
  let ph = "";
  if (isEditMode)  ph = "Leave blank to keep current password";

  let disablefield = false;
  if (which == 'ownersdashboard') {
    disablefield = true;
  }

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

              <div style={{ marginBottom: "15px", marginTop: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Role
                </label>

                <select className="standardselect"
                  value={formData.role}
                  onChange={handleInputChange}
                  name="role"
                >
                   <option value="owner">Owner</option>
                   <option value="admin">Admin</option>
                  <option value="enforcer">Enforcer</option>
                </select>
              </div>

             

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Unit Number
                </label>
                <input className="standardinput"
                  type="text"
                  name="unitnumber"
                  value={formData.unitnumber}
                  onChange={handleInputChange}
                   disabled={disablefield}
                />
              </div>
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
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              {/* {!isEditMode && ( */}
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                     placeholder={ph}
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
                <label className="input-label">
                  <input
                    type="checkbox"
                    name="handicapped"
                    checked={formData.handicapped}
                    onChange={handleInputChange}
                  />
                  {" "}Handicapped
                </label>
              </div>
              {/* )} */}



              <div className="button-grid">
                <button className="btn btn-primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : isEditMode ? "Update User" : "Create User"}
                </button>

                <button className="btn btn-cancel"
                  type="button"
                  onClick={handleBackToUsers}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                {isEditMode && (
                  <button className="btn btn-danger"
                    type="button"

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
