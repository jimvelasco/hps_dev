import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../services/api";
import { useHoa } from "../context/HoaContext";
import { useLoggedInUser } from "../hooks/useLoggedInUser";


import { useError } from "../context/ErrorContext";
import DashboardNavbar from "../components/DashboardNavbar";
import ModalAlert from "../components/ModalAlert";
import { getAWSResource } from "../utils/awsHelper";


export default function UnitDetails() {
  // const { hoaId: hoaid, unitnumber:unitnumber } = useParams();
  const { hoaId: hoaid } = useParams();
  // console.log('START we are loading hoaid', hoaid)
  //   console.log('ud we are loading unitnumber',unitnumber)
  const navigate = useNavigate();
  const { hoa, loading: hoaLoading, error: hoaError, fetchHoaById } = useHoa();
  const { user: loggedInUser, loading: userLoading, clearLoggedInUser } = useLoggedInUser();
  const { setAppError } = useError();
  const [loading, setLoading] = useState(Boolean(!hoaid));
  const [error, setError] = useState(null);

  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null, onCancel: null });
  const location = useLocation();
  const { homeownersid, numonunit, which } = location.state || {};


  //const { unitNumber, role, vehicles, ownerOfUnit, vehid } = location.state || {};
  const [formData, setFormData] = useState({
    hoaid: homeownersid || hoaid || "",
    unitnumber: numonunit || "",
    bedrooms: 2,
    inventory_allowed_owner: "",
    parking_allowed_owner: "",
    parking_allowed_renter: "",
    owner_free_parking: "",
    renter_free_parking: "",
    pincode: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!numonunit && hoaid && hoa?.hoaid !== hoaid) {
      fetchHoaById(hoaid);
    }
  }, [numonunit, hoaid, hoa?.hoaid, fetchHoaById]);

  useEffect(() => {
    if (numonunit || !hoa || hoa.hoaid !== hoaid) return;

    setFormData(prev => ({
      ...prev,
      hoaid,
      inventory_allowed_owner: prev.inventory_allowed_owner === "" ? hoa.inventory_allowed_owner ?? "" : prev.inventory_allowed_owner,
      parking_allowed_owner: prev.parking_allowed_owner === "" ? hoa.parking_allowed_owner ?? "" : prev.parking_allowed_owner,
      parking_allowed_renter: prev.parking_allowed_renter === "" ? hoa.parking_allowed_renter ?? "" : prev.parking_allowed_renter,
      owner_free_parking: prev.owner_free_parking === "" ? hoa.owner_free_parking_spots ?? "" : prev.owner_free_parking,
      renter_free_parking: prev.renter_free_parking === "" ? hoa.renter_free_parking_spots ?? "" : prev.renter_free_parking
    }));
  }, [numonunit, hoaid, hoa]);

  // console.log('formdata is ', formData)
  // console.log('location state is ', location.state)




  /*

  const { role } = location.state || {};

  this is how we send stuff

    const qry = `/${hoaId}/vehicledetails/create/${userIdForUnit}`;
    //  const qry = `/${hoaId}/vehicledetails/create/${fakevid}`;
    navigate(qry, {
      state: {
        unitNumber: unitNumber, role: "renter",
        vehicles: vehicles,
        ownerOfUnit: ownerOfUnit,
        vehid: null
      }
    });
  */

  useEffect(() => {
    if (!numonunit) return;
    //   const unum = loggedInUser.unitnumber;
   
    const fetchUnit = async () => {
      try {
        setLoading(true);
     //   console.log('submit form data is  is ', formData);
        //  const response = await axios.get(`/units/YV/111`);
        //  const response = await axios.get(`/YV/995`);
        let qry = `/units/${encodeURIComponent(homeownersid)}/${encodeURIComponent(numonunit)}`;
     //   console.log('qry', qry)
        const response = await axios.get(qry);
        setFormData({
          hoaid: response.data.hoaid || "",
          unitnumber: response.data.unitnumber || "",
          bedrooms: response.data.bedrooms || "",
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
    fetchUnit();
  }, [homeownersid, numonunit]);

 
  if (hoaError) {
    setAppError(hoaError);
    navigate(`/${hoaid}/error`);
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
    console.log('WE ARE SUBMITTING')

    if (!formData.pincode) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: "Please fill in all required fields (picode ,bedrooms)",
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
        hoaid: formData.hoaid,
        unitnumber: formData.unitnumber,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : 0,
        pincode: formData.pincode,
        inventory_allowed_owner: formData.inventory_allowed_owner ? parseInt(formData.inventory_allowed_owner) : undefined,
        parking_allowed_renter: formData.parking_allowed_renter ? parseInt(formData.parking_allowed_renter) : undefined,
        parking_allowed_owner: formData.parking_allowed_owner ? parseInt(formData.parking_allowed_owner) : undefined,
        owner_free_parking: formData.owner_free_parking ? parseInt(formData.owner_free_parking) : undefined,
        renter_free_parking: formData.renter_free_parking ? parseInt(formData.renter_free_parking) : undefined
      };



   //   console.log('user detail submit data is ', submitData);
      let qry = `/units/updateunit/`;

     // qry = `/units/updateunit/`


      // const response = await axios.put(`/users/${userId}`, submitData);

      if (!numonunit) {
        const response = await axios.post("/units", submitData);
        if (response.status === 201) {
          setModal({
            isOpen: true,
            type: "alert",
            title: "Success",
            message: `Unit ${response.data.unit.unitnumber} created successfully.`,
            confirmText: "OK",
            onConfirm: () => {
              setModal(prev => ({ ...prev, isOpen: false }))
              navigate(`/${hoaid}/users`);
            }
          });
        }
      } else {
         const response = await axios.put(qry, submitData);
        if (response.status === 200) {
          setModal({
            isOpen: true,
            type: "alert",
            title: "Success",
            message: `Unit ${response.data.unit.unitnumber} updated successfully.`,
            confirmText: "OK",
            onConfirm: () => {
              setModal(prev => ({ ...prev, isOpen: false }))
              navigate(`/${hoaid}/dashboard`);
            }
          });
        }

      }


    } catch (err) {
      let serverResponse = err.response.data;
   //   console.log('server response', serverResponse);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // message: `Error: ${err.response?.data?.message || err.message}`,

  const handleBackToUsers = () => {
   // console.log('back to dashboard', which)
    // console.log('we are loading hoaid',hoaid)
    // console.log('we are loading unitnumber',unitnumber)
    let qry = `/${hoaid}/dashboard`;
    if (which === 'admin') {
      qry = `/${hoaid}/users`;
    }
    navigate(qry);
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
              navigate(`/${hoaid}/users`);
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
  const isEditMode = !!numonunit;

  // console.log(isEditMode, isEditMode);

  const isAdminView = which === 'admin';

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <DashboardNavbar title={isEditMode ? "Edit Unit" : "Create Unit"} buttons={navButtons} />

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

        {loading || (!numonunit && (!hoa || hoa.hoaid !== hoaid)) ? (
          <p style={{ color: "#666" }}>Loading unit data...</p>
        ) : (
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
          }}>
            <h2 style={{ color: "#1976d2", marginTop: 0, marginBottom: "10px" }}>
              {isEditMode ? "Edit Unit" : "Create New Unit"}
            </h2>

            <form onSubmit={handleSubmit}>
               <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Unit Number
                </label>
                <input className="standardinput"
                  type="text"
                  name="unitnumber"
                  value={formData.unitnumber}
                  onChange={handleInputChange}
                  disabled={!isAdminView}
                />
              </div>
              
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  PIN #
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
                  Bedrooms
                </label>
                <input className="standardinput"
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  disabled={!isAdminView}
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
                  disabled={!isAdminView}

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
                  disabled={!isAdminView}
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
                  disabled={!isAdminView}
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
                  disabled={!isAdminView}
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
                  disabled={!isAdminView}
                />
              </div>


              <div className="button-grid">
                <button className="btn btn-primary"
                  type="submit"
                  disabled={isSubmitting}

                >
                  {isSubmitting ? "Saving..." : isEditMode ? "Update Unit" : "Create Unit"}
                </button>

                <button className="btn btn-cancel"
                  type="button"
                  onClick={handleBackToUsers}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                {/* {isEditMode && (
                  <button className="btn btn-danger"
                    type="button"

                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    Delete
                  </button>
                )} */}
              </div>

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
