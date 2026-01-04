import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../services/api";
import { useHoa } from "../context/HoaContext";
import { useLoggedInUser } from "../hooks/useLoggedInUser";

import DashboardNavbar from "../components/DashboardNavbar";
import ModalAlert from "../components/ModalAlert";
import { okToActivateOwnerVehicle , okToActivateRenterVehicle,utcDateOnly } from "../utils/vehicleHelpers";

import mongoose from "mongoose";


export default function VehicleDetails() {
  const ObjectId = mongoose.Schema.Types.ObjectId;
  const { hoaId, which, vehicleId } = useParams();
  // vehicleId could be either the id of the vehicle if which is modify.
  // or it could be the unitnumber if which is create.
  //console.log("VehicleDetails.jsx params:", { hoaId, which, vehicleId });
  const navigate = useNavigate();
  const isModifyMode = which === "modify";
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { user: loggedInUser, loading: userLoading, clearLoggedInUser } = useLoggedInUser();
  const location = useLocation();
  // the unitNumber is passed via state when navigating to create a vehicle from RenterVehicles.jsx
  // if we get to the page from OwnerVehicles.jsx the loggedInUser will have the unitnumber so we can use that
  const { unitNumber, role, vehicles, ownerOfUnit ,vehid} = location.state || {};
  const [userIdForUnit, setUserIdForUnit] = useState();
  const [unitOwner, setUnitOwner] = useState();
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null, onCancel: null });


  const edate = new Date();
  edate.setDate(edate.getDate() + 3);


  //console.log(edate);

  const [termsAcknowledged, setTermsAcknowledged] = useState(false);
  const [formData, setFormData] = useState({
    // ownerid: loggedInUser ? loggedInUser._id : null,
    // carowner_fname: "",
    // carowner_lname: "",
    // carownerphone: "",
    //  make: "",
    // model: "",
    // year: "",
    // vehicle_type: "",
    // plate: "",
    // plate_state: "",
    carowner_fname: "JJV",
    carowner_lname: "Velasco",
    carownerphone: "7777777777",
    make: "Lincoln",
    model: "Navigator",
    year: "2020",
    vehicle_type: "Car",
    plate: "",
    plate_state: "TX",
    unitnumber: unitNumber,
    carownertype: role,

   
    startdate: new Date().toLocaleDateString("en-CA"),
    enddate: edate.toLocaleDateString("en-CA"),
  //  checkin: new Date().toISOString().substring(0, 10),
  // checkout: new Date().toISOString().substring(0, 10)
  });
  const { hoa, loading: hoaLoading, error: hoaError, fetchHoaById } = useHoa();

  useEffect(() => {
    const storedTermsAcknowledged = sessionStorage.getItem("termsAcknowledged");
    if (storedTermsAcknowledged === "true") {
      setTermsAcknowledged(true);
    }
  }, []);

  // useEffect(() => {
  //  console.log('VehicleDetails.jsx useEffect - location.state:', location.state);
  // }, [location.state]);




  useEffect(() => {
    // if (userLoading) {return}

    if (hoaId && unitNumber) {
      const fetchUserForUnit = async () => {
        try {
          const response = await axios.get("/users", { params: { hoaId } });
          const user = response.data.find(u => u.unitnumber === unitNumber && u.hoaid === hoaId);
          if (user) {
            // console.log('we found a user for unit:',unitNumber,user);
            setUserIdForUnit(user._id);
            setUnitOwner(user);
          } else {
            console.log('No user found for unit:', unitNumber);
          }
        } catch (err) {
          // console.error("Error fetching user for unit:", err);
        }
      };
      fetchUserForUnit();
    }
  }, [hoaId, unitNumber]);

  useEffect(() => {
    //  if (userLoading) {return}
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const qry = `/vehicles/id/${vehid}`;
        // console.log("VehicleDetails.jsx qry:", qry);
        const response = await axios.get(qry);
       
        const sd = utcDateOnly(response.data.checkin);
        const ed = utcDateOnly(response.data.checkout);


        //  console.log("checkin date:", sd,'before local', response.data.checkin);
        //  console.log("checkout date:", ed, 'before local',response.data.checkout);
        //  console.log("checkout date:',ed );
        //  let oid = loggedInUser ? loggedInUser._id : userIdForUnit;
        setFormData({
          // ownerid: oid || null,
          carowner_fname: response.data.carowner_fname || "",
          carowner_lname: response.data.carowner_lname || "",
          carownerphone: response.data.carownerphone || "",
          //   unitnumber: response.data.unitnumber || "",
          unitnumber: unitNumber || "",
          carownertype: response.data.carownertype || "owner",
          //  carownertype: loggedInUser ? loggedInUser.role : "renter",
         // carownertype: role,
          make: response.data.make || "",
          model: response.data.model || "",
          year: response.data.year || "",
          vehicle_type: response.data.vehicle_type || "",
          plate: response.data.plate || "",
          plate_state: response.data.plate_state || "",
          //  active_flag: response.data.active_flag || 0,
          // startdate: response.data.startdate || "",
          startdate: sd,
          enddate: ed,
          requires_payment: response.data.requires_payment || 0,
        });
        // console.log("VehicleDetails.jsx populated from useEffect formData:", formData);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load vehicle details");
      } finally {
        setLoading(false);
      }
    };

    if (isModifyMode && vehid) {
      fetchVehicle();
    } else if (!isModifyMode) {
      setLoading(false);
    }
  }, [isModifyMode, vehid]);

  const handleBackClick = () => {
    // console.log('back clicked in Vehicle Details')
    // navigate(`/${hoaId}/ownervehicles`);
    navigate(-1);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    // console.log(`Form change - Name: ${name}, Value: ${value}, Type: ${type}, Checked: ${checked}`);
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value
    }));
  };

  const handleTermsAcknowledged = (e) => {
    const checked = e.target.checked;
    setTermsAcknowledged(checked);
    sessionStorage.setItem("termsAcknowledged", checked);
  };

  const handleDeleteClick = () => {
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Delete Vehicle",
      message: "Are you sure you want to delete this vehicle? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        setModal(prev => ({ ...prev, isOpen: false }));
        setFormSubmitting(true);
        try {
          const response = await axios.delete(`/vehicles/${vehid}`);

          if (response.status === 200) {
            setModal({
              isOpen: true,
              type: "alert",
              title: "Success",
              message: "Vehicle deleted successfully!",
              confirmText: "OK",
              onConfirm: () => {
                setModal(prev => ({ ...prev, isOpen: false }));
                navigate(-1);
              }
            });
          }
        } catch (err) {
          setModal({
            isOpen: true,
            type: "alert",
            title: "Error",
            message: `Error deleting vehicle: ${err.response?.data?.message || err.message}`,
            confirmText: "OK",
            onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
          });
        } finally {
          setFormSubmitting(false);
        }
      },
      onCancel: () => setModal(prev => ({ ...prev, isOpen: false }))
    });
  };



  /*
owner_free_parking 1
parking_allowed 5
parking_allowed_owner 2
parking_allowed_renter 2
renter_free_parking 1
  */

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('handleFormSubmit role is:', role);
    if (!formData.carowner_fname || !formData.carowner_lname || !formData.carownerphone
      || !formData.make || !formData.plate) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: "Please fill in all required fields",
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }))
        }
      });
      return;
    }

    if (role === 'renter') {
      const todayStr = new Date().toLocaleDateString("en-CA");
      const edate = formData.enddate;
    //  console.log('Renter enddate is:', edate);
    //  console.log('todayStr is:', todayStr);
      const startDate = new Date(todayStr).getTime();
      const endDate = new Date(edate).getTime();
      if (startDate > endDate) {
        setModal({
          isOpen: true,
          type: "alert",
          title: "Validation Error",
          message: "End date must be after current date.",
          confirmText: "OK",
          onConfirm: () => {
            setModal(prev => ({ ...prev, isOpen: false }))
          }
        });
        return;
      }
    }





    const renterFreeParking = ownerOfUnit?.renter_free_parking || 0;
    const ownerFreeParking = ownerOfUnit?.owner_free_parking || 0;
    // console.log('renterFreeParking:', renterFreeParking);
    //  console.log('ownerFreeParking:', ownerFreeParking);
    // console.log('vehicles:', vehicles);
    // console.log('role:', role);
    // console.log('unitOwner:', unitOwner);
    let msg = ("You are not allowed to have more active vehicles than your parking allowance. \n Please deactivate another vehicle before activating this one.")

   //const oktoaddobj = okToActivateVehicle(formData, vehicles, role, unitOwner,vehid);
   let oktoaddobj =  { oktoadd: false, activecount: 0 };;
    let rpflag = 0;
    if (role === 'owner') {
     // rpflag = 0;
       oktoaddobj = okToActivateOwnerVehicle(formData, vehicles, role, unitOwner,vehid);
      console.log('oktoaddobj:', oktoaddobj);
      if (!oktoaddobj.oktoadd) {
        setModal({
          isOpen: true,
          type: "alert",
          title: "Validation Error",
          message: "You are not allowed to have more active vehicles than your parking allowance. \n Please deactivate another vehicle before activating this one.",
          confirmText: "OK",
          onConfirm: () => {
            setModal(prev => ({ ...prev, isOpen: false }))
          }
        });
        return;
      } else {
      rpflag = oktoaddobj.rpflag; //0;
      }
    }
    if (role === 'renter') {
      console.log('renter vehid',vehid,vehicles.length);
       oktoaddobj = okToActivateRenterVehicle(formData, vehicles, role, unitOwner,vehid);
      if (vehicles.length < renterFreeParking) {
        rpflag = 0;
      } else {
        if (!vehid) {
          rpflag = oktoaddobj.rpflag;
        } else {
         rpflag = oktoaddobj.rpflag;
        }
      }
    }
  
    setFormSubmitting(true);


    try {
      let oid = loggedInUser ? loggedInUser._id : userIdForUnit;
      const vehiclePayload = {
        ...formData,
        hoaid: hoaId,
        ownerid: oid,
        requires_payment: rpflag
      };
      // console.log("Submitting vehiclePayload:", isModifyMode,vehiclePayload);

      if (isModifyMode) {
        const response = await axios.put(`/vehicles/${vehid}`, vehiclePayload);

        if (response.status === 200) {
          setModal({
            isOpen: true,
            type: "alert",
            title: "Success",
            message: "Vehicle updated successfully!",
            confirmText: "OK",
            onConfirm: () => {
              setModal(prev => ({ ...prev, isOpen: false }));
              navigate(-1);
            }
          });
        }
      } else {
      //  console.log("Submitting vehiclePayload:", isModifyMode, vehiclePayload);
        const response = await axios.post("/vehicles", vehiclePayload);

        if (response.status === 201) {
          setModal({
            isOpen: true,
            type: "alert",
            title: "Success",
            message: "Vehicle created successfully!",
            confirmText: "OK",
            onConfirm: () => {
              setModal(prev => ({ ...prev, isOpen: false }));
              navigate(-1);
            }
          });
        }
      }
    } catch (err) {
      // console.log('xxxxxxerror in form submit:', err);
      // console.log('err.response?.data', err.response.data.errors[0].message, err.response.data.errors[0].code);
      // let msg = err.response?.data.errors[0].message + ' OR ' + err.response.data.errors[0].code;
      // console.log('msg:', msg,err.message);

      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        //  message: `Error ${isModifyMode ? "updating" : "creating"} vehicle: ${err.response?.data.message || err.message}`,
        message: `Error ${isModifyMode ? "updating" : "creating"} vehicle: ${err.response?.data.errors[0].message || err.message}`,
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
      // return
    } finally {
     // console.log('finally block reached');
      setFormSubmitting(false);
    }
  };

  const navButtons = [
    {
      label: "Back",
      onClick: handleBackClick,
      // color: "#2196f3",
      // hoverColor: "#1976d2",
      which: "goback"
    }
  ];

  const pageTitle = isModifyMode ? "Modify Vehicle" : "Create New Vehicle";

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <DashboardNavbar title={pageTitle} buttons={navButtons} />
        <div className="ajaxloader">
          <p style={{ color: "#666" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <DashboardNavbar title={pageTitle} buttons={navButtons} />
        <div className="displayerror">
          <p><strong>Error:</strong> {error}</p>
        </div>
      </div>
    );
  }

  let backgroundImage = '';
  if (hoa) {
    backgroundImage = hoa.background_image_url;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <DashboardNavbar title={pageTitle} buttons={navButtons} />

      <div className="page-content">
        <div style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>
          <h2 style={{ color: "#333", marginTop: 0 }}>
            {pageTitle}
          </h2>
          <form onSubmit={handleFormSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              {/* Owner Information */}
              <div>
                <h3 style={{ color: "#1976d2" }}>Owner Information</h3>

                <div style={{ marginBottom: "15px" }}>
                  <label className="input-label">
                    First Name *
                  </label>
                  <input className="standardinput"
                    type="text"
                    name="carowner_fname"
                    value={formData.carowner_fname}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label className="input-label">
                    Last Name *
                  </label>
                  <input className="standardinput"
                    type="text"
                    name="carowner_lname"
                    value={formData.carowner_lname}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label className="input-label">
                    Phone *
                  </label>
                  <input className="standardinput"
                    type="tel"
                    name="carownerphone"
                    value={formData.carownerphone}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                
                
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Owner Type
                  </label>
                  <select
                    name="carownertype"
                    value={formData.carownertype}
                    onChange={handleFormChange}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="owner">Owner</option>
                    <option value="friend">Friend</option>
                    <option value="renter">Renter</option>
                  </select>
                </div>

                  <div style={{ marginBottom: "15px" }}>
                  <label className="input-label">
                    Unit Number
                  </label>
                  <input className="standardinput"
                    type="text"
                    name="unitnumber"
                    value={formData.unitnumber}
                    onChange={handleFormChange}
                    disabled
                  />
                </div>


              </div>

              {/* Vehicle Information */}
              <div>
                <h3 style={{ color: "#1976d2" }}>Vehicle Information</h3>

                <div style={{ marginBottom: "15px" }}>
                  <label className="input-label">
                    Make *
                  </label>
                  <input className="standardinput"
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label className="input-label">
                    Model
                  </label>
                  <input className="standardinput"
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleFormChange}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label className="input-label">
                    Year
                  </label>
                  <input className="standardinput"
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleFormChange}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label className="input-label">
                    Vehicle Type
                  </label>
                  <input className="standardinput"
                    type="text"
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleFormChange}
                    placeholder="e.g., Car, SUV, Truck"
                  />
                </div>
              </div>

              {/* License Plate & Status */}
              <div>
                <h3 style={{ color: "#1976d2" }}>Registration & Status</h3>

                <div style={{ marginBottom: "15px" }}>
                  <label className="input-label">
                    License Plate *
                  </label>
                  <input className="standardinput"
                    type="text"
                    name="plate"
                    value={formData.plate}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label className="input-label">
                    Plate State
                  </label>
                  <input className="standardinput"
                    type="text"
                    name="plate_state"
                    value={formData.plate_state}
                    onChange={handleFormChange}
                    placeholder="e.g., CO, CA, TX"
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label className="input-label">
                    Check In
                  </label>
                  <input className="standardinput"
                    type="date"
                    name="startdate"
                    // value={new Date(formData.startdate).toISOString().substring(0, 10)}
                    value={formData.startdate}


                    onChange={handleFormChange}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label className="input-label">
                    Check Out
                  </label>
                  <input className="standardinput"
                    type="date"
                    name="enddate"
                    value={formData.enddate}
                    onChange={handleFormChange}
                  />
                </div>

                {/* <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "flex", alignItems: "center", fontWeight: "bold" }}>
                      <input
                        type="checkbox"
                        name="active_flag"
                        checked={formData.active_flag === 1}
                        onChange={handleFormChange}
                        style={{ marginRight: "10px", width: "18px", height: "18px" }}
                      />
                      Active
                    </label>
                  </div> */}
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  id="termsCheckbox"
                  checked={termsAcknowledged}
                  onChange={handleTermsAcknowledged}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <label htmlFor="termsCheckbox" style={{ margin: 0, cursor: "pointer", color: "#666" }}>
                  I have read and acknowledge the{" "}
                  <a 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/${hoaId}/terms-and-conditions`, {
                        state: {
                          role: role,
                        }
                      });
                    }}
                    href="#" 
                    style={{ color: "#1976d2", textDecoration: "underline", cursor: "pointer" }}>
                    Terms and Conditions
                  </a>
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button className="standardsubmitbutton"
                  type="submit"
                  disabled={formSubmitting || !termsAcknowledged}
                >
                  {formSubmitting ? (isModifyMode ? "Updating..." : "Creating...") : (isModifyMode ? "Update" : "Create")}
                </button>
                <button className="standardcancelbutton"
                  type="button"
                  onClick={handleBackClick}
                >
                  Cancel
                </button>
                {isModifyMode && (
                  <button className="standarddeletebutton"
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={formSubmitting || !termsAcknowledged}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
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
