import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../services/api";
import { useHoa } from "../context/HoaContext";
import { useLoggedInUser } from "../hooks/useLoggedInUser";

import DashboardNavbar from "../components/DashboardNavbar";
import ModalAlert from "../components/ModalAlert";
import { utcDateOnly, okToAddUnitVehicle } from "../utils/vehicleHelpers";
import { getAWSResource } from "../utils/awsHelper";
//import PlateLookup from "../components/PlateLookup";

import mongoose from "mongoose";

const formatLocalDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

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
  const [todayString, setTodayString] = useState("")
  const location = useLocation();


  const { nonownerType, unitNumber, role, vehicles, ownerOfUnit, vehid, unit, carownertype,
    createdfrom, pincodeValue, pincodeAction, allActiveVehiclesCount } = location.state || {};


  // const vehicleOwnerTypeAry = unit?.day_use_only === 1
  //   ? ['visitor', 'contractor']
  //   : ['owner', 'family', 'friend', 'visitor', 'contractor'];

  const vehicleOwnerTypeAry = unit?.day_use_only === 1 || pincodeAction === 'daypass'
    ? ['visitor', 'contractor']
    : ['owner', 'family', 'friend', 'tenant', 'visitor', 'contractor'];



  //console.log('VD LOCATION STATE',location.state);



  // JJVFIX const selectedOwnerType = createdfrom === "rentervehicles"
  //   ? nonownerType || role || ""
  //   : carownertype || (vehicleOwnerTypeAry.includes(role) ? role : "");

  // 
  const selectedOwnerType = createdfrom === "rentervehicles"
    ? nonownerType
    : carownertype || vehicleOwnerTypeAry[0];

  //console.log('VD selectedOwnerType',selectedOwnerType)



  const [userIdForUnit, setUserIdForUnit] = useState();
  const [unitOwner, setUnitOwner] = useState();
  const [stateUnit, setStateUnit] = useState();
  const [disableInDateField, setDisableInDateField] = useState(false)
  const [disableOutDateField, setDisableOutDateField] = useState(false)
  const [createdByType, setCreatedByType] = useState("owner");
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null, onCancel: null });
  const { hoa, loading: hoaLoading, error: hoaError, fetchHoaById } = useHoa();

  const [isPlateLookupOpen, setIsPlateLookupOpen] = useState(false);

  // const handlePlateDetected = (data) => {
  //   // Mapping from Plate Recognizer vehicle types to our options
  //   console.log('handlePlateDetected jjv data:', data);
  //   const typeMapping = {
  //     'sedan': 'Car',
  //     'suv': 'Car',
  //     'van': 'Car',
  //     'pickup': 'Truck',
  //     'truck': 'Truck',
  //     'bus': 'Other',
  //     'motorcycle': 'Motorcyle',
  //     'rv': 'RV'
  //   };

  //   setFormData(prev => ({
  //     ...prev,
  //     plate: data.plate || prev.plate,
  //     make: data.make ? (data.make.charAt(0).toUpperCase() + data.make.slice(1)) : prev.make,
  //     model: data.model ? (data.model.charAt(0).toUpperCase() + data.model.slice(1)) : prev.model,
  //     vehicle_type: typeMapping[data.type?.toLowerCase()] || (data.type ? 'Other' : prev.vehicle_type)
  //   }));
  // };

  const defaultDayUseOnly = createdfrom === 'rentervehicles'
    ? unit?.day_use_only === 1 || nonownerType === 'contractor' || nonownerType === 'visitor' ? 1 : 0
    : createdfrom === 'ownervehicles' && (unit?.day_use_only === 1 || pincodeAction === 'daypass') ? 1 : 0;


  // let daysplus = 3;

  // if (createdfrom === 'ownervehicles' && pincodeAction === 'daypass') {
  //   daysplus = 0;
  // }
  // if (createdfrom === 'rentervehicles' && carownertype === 'visitor') {
  //   daysplus = 0;
  // }
  // if (createdfrom === 'rentervehicles' && carownertype === 'contractor') {
  //   daysplus = 0;
  // }

  // const edate = new Date();
  // edate.setDate(edate.getDate() + daysplus);



  const [termsAcknowledged, setTermsAcknowledged] = useState(false);

  const [formData, setFormData] = useState({
    carowner_fname: "",
    carowner_lname: "",
    carownerphone: "",
    make: "",
    model: "",
    color: "",
    year: "",
    vehicle_type: "Car",
    plate: "",
    plate_state: "",
    unitnumber: unitNumber || "",
    carownertype: isModifyMode ? carownertype || "" : selectedOwnerType,
    pin_code_value: pincodeValue,
    pin_code_action: pincodeAction,
    day_use_only: defaultDayUseOnly,

    startdate: formatLocalDate(new Date()),
    enddate: formatLocalDate(new Date())
  });

  useEffect(() => {

    let daysplus = 0;

    if (createdfrom === "rentervehicles") {
      setCreatedByType("other");
    }
    if (createdfrom === 'rentervehicles' && carownertype === 'visitor') {
      daysplus = 0;

      setDisableInDateField(true);
      setDisableOutDateField(true)
    }
    if (createdfrom === 'rentervehicles' && carownertype === 'contractor') {
      daysplus = 0;
      setDisableInDateField(true);
      setDisableOutDateField(false)
    }
    if (createdfrom === 'ownervehicles') {
      daysplus = 3;
      setDisableInDateField(false);
      setDisableOutDateField(false)
    }

    const edate = new Date();
    edate.setDate(edate.getDate() + daysplus);


    // JJVFIX
    console.log("VEHICLE DETAILS LOCATION STATE IS ", location.state);




    if (hoa && !isModifyMode) {
      let dmode = hoa.use_demo_mode;
      //  console.log('dmode:', dmode);
      if (dmode === 1) {
        setFormData({
          carowner_fname: "Mary",
          carowner_lname: "Smith",
          carownerphone: "707-123-5569",
          make: "Lincoln",
          model: "Navigator",
          color: "Green",
          year: "2020",
          vehicle_type: "Car",
          plate: "",
          plate_state: "CO",
          unitnumber: unitNumber,
          carownertype: selectedOwnerType,
          pin_code_value: pincodeValue,
          pin_code_action: pincodeAction,
          day_use_only: defaultDayUseOnly,
          startdate: formatLocalDate(new Date()),
          enddate: formatLocalDate(edate),

        }
        )
      }
      if (dmode === 0) {
        setFormData({
          carowner_fname: "",
          carowner_lname: "",
          carownerphone: "",
          make: "",
          model: "",
          color: "",
          year: "",
          vehicle_type: "Car",
          plate: "",
          plate_state: "",
          unitnumber: unitNumber,
          carownertype: selectedOwnerType,
          pin_code_value: pincodeValue,
          pin_code_action: pincodeAction,
          day_use_only: defaultDayUseOnly,
          startdate: formatLocalDate(new Date()),
          enddate: formatLocalDate(edate),
        }
        )
      }
    }
  }, [hoaId]);




  useEffect(() => {
    const storedTermsAcknowledged = sessionStorage.getItem("termsAcknowledged");
    if (storedTermsAcknowledged === "true") {
      setTermsAcknowledged(true);
    }

  }, []);

  useEffect(() => {

    setUserIdForUnit(ownerOfUnit._id);
    setUnitOwner(ownerOfUnit);
    setStateUnit(unit);
  }, [hoaId, unitNumber, formData.unitnumber, isModifyMode]);



  useEffect(() => {
    //  if (userLoading) {return}
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const qry = `/vehicles/id/${vehid}`;
        // console.log("VehicleDetails.jsx qry:", qry);
        const response = await axios.get(qry);
        // console.log('about to set vehicle', response.data)
        setVehicle(response.data);


        let sd = response.data.startdate;
        let ed = response.data.enddate;

        // if (createdfrom === 'rentervehicles' && (carownertype === 'visitor' || carownertype === 'contractor')) {

        if (createdfrom === 'rentervehicles' && (carownertype === 'visitor')) {
          sd = formatLocalDate(new Date());
          ed = formatLocalDate(new Date());
          setDisableInDateField(true)
          setDisableOutDateField(true)
        }
        if (createdfrom === 'rentervehicles' && (carownertype === 'contractor')) {
          sd = formatLocalDate(new Date());
          ed = formatLocalDate(new Date());
          setDisableInDateField(true)
          // setDisableOutDateField(true)
        }


        setFormData({
          // ownerid: oid || null,
          carowner_fname: response.data.carowner_fname || "fname",
          carowner_lname: response.data.carowner_lname || "lname",
          carownerphone: response.data.carownerphone || "phone",
          unitnumber: response.data.unitnumber || "un",
          carownertype: response.data.carownertype || "cot",
          make: response.data.make || "",
          model: response.data.model || "",
          color: response.data.color || "",
          year: response.data.year || "",
          vehicle_type: response.data.vehicle_type || "",
          plate: response.data.plate || "",
          plate_state: response.data.plate_state || "",
          startdate: sd,
          enddate: ed,
          requires_payment: response.data.requires_payment || 0,
          day_use_only: response.data.day_use_only ?? 0,
          pin_code_value: pincodeValue,
          pin_code_action: pincodeAction,
        });
        //    console.log("VehicleDetails.jsx populated from useEffect formData:", formData);

        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load vehicle details");
      } finally {
        setLoading(false);
      }
    };

    if (isModifyMode && vehid) {
      //   console.log('we are fetching vehicle')
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
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
      ...(name === "carownertype" && { day_use_only: value === "visitor" || value === "contractor" ? 1 : 0 })
    }));
  };

  const handleTermsAcknowledged = (e) => {
    const checked = e.target.checked;
    setTermsAcknowledged(checked);
    sessionStorage.setItem("termsAcknowledged", checked);
  };

  const handleDeleteClick = () => {
    //   console.log('delete button clicked');
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




  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const todayUTC = new Date(); // "2025-12-03"
    const todayStr = formatLocalDate(todayUTC);

    if (!isModifyMode && createdfrom === "rentervehicles" && (!pincodeValue || typeof pincodeAction !== "string")) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: "PIN information is unavailable. Please log in again.",
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    const requiredFields = [
      "carowner_fname",
      "carowner_lname",
      "carownerphone",
      "carownertype",
      "make",
      "plate",
      "plate_state",
      "unitnumber"
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: `Please fill in the following required fields: ${missingFields.join(", ")}`,
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }))
        }
      });
      return;
    }

    const datemsg = <>Check In: {formData.startdate}<br />is after <br />Check Out: {formData.enddate}</>;

    //   console.log('VD form data is ',formData);

    if (formData.enddate < formData.startdate) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: datemsg,
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }))
        }
      });
      return;
    }

    const templatemsg = <>Check Out: {formData.enddate}<br />must be before <br />Today: {todayStr}</>;

    // if (createdfrom === 'ownervehicles' && (formData.carownertype === 'contractor' || formData.carownertype === 'visitor')) {
    //JJVFIX. do we need this
    // if (createdfrom === 'ownervehicles' && (formData.carownertype === 'visitor')) {
    //   if (formData.enddate > todayStr) {
    //     setModal({
    //       isOpen: true,
    //       type: "alert",
    //       title: "Validation Error",
    //       message: templatemsg,
    //       confirmText: "OK",
    //       onConfirm: () => {
    //         setModal(prev => ({ ...prev, isOpen: false }))
    //       }
    //     });
    //     return;
    //   }
    // }




    //  const { unitNumber, role, vehicles, ownerOfUnit, vehid, unit } = location.state || {};


    // const renterFreeParking = ownerOfUnit?.renter_free_parking || 0;
    // const ownerFreeParking = ownerOfUnit?.owner_free_parking || 0;

    // let msg = ("You are not allowed to have more active vehicles than your parking allowance. \n Please deactivate another vehicle before activating this one.")

    //const oktoaddobj = okToActivateVehicle(formData, vehicles, role, unitOwner,vehid);

    let oktoaddobj = { oktoadd: false, activecount: 0 };
    oktoaddobj = okToAddUnitVehicle(formData, vehicles, unitOwner, vehid, stateUnit, createdfrom, pincodeAction, allActiveVehiclesCount);
    console.log('VEHICLE DETAILS oktoaddobj', oktoaddobj);
    let rpflag = 0;
    let msg = "";

    if (createdfrom === 'ownervehicles') {
      msg = (<>You are not allowed to have more active vehicles than your parking allowance. <br />
        Please deactivate another vehicle before activating this one.</>);
      if (oktoaddobj.msgType === 2) {
        msg = (<>Daypass limit reached. <br />
          You are allowed 1 Day Pass.</>);
      }

    }
    if (createdfrom === 'rentervehicles') {
      msg = (<>You are not allowed to have more active vehicles than your parking allowance. <br />
        CALL THE OWNER OR ADMIN</>);
      if (oktoaddobj.msgType === 2) {
        msg = (<>Daypass limit reached. <br />
          You are allowed 1 Day Pass.</>);
      }
    }
    //   if (role === 'owner') {
    //      oktoaddobj = okToActivateOwnerVehicle(formData, vehicles, role, unitOwner, vehid, stateUnit, createdfrom, pincodeAction);
    if (!oktoaddobj.oktoadd) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: msg,
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }))
        }
      });
      return;
    } else {
      rpflag = oktoaddobj.rpflag; //0;
    }
    //   }
    // if (role === 'renter') {
    //   oktoaddobj = okToActivateRenterVehicle(formData, vehicles, role, unitOwner, vehid, stateUnit, createdfrom, pincodeAction);
    //   rpflag = oktoaddobj.rpflag;
    // }




    setFormSubmitting(true);

    let vehcbt = "";

    let cv = oktoaddobj.currentVehicle;
    if (cv !== null) {
      vehcbt = cv.createdbytype;
    }

    //   console.log('the cv is ',cv,unitcbt)

    // JJVFIX
    try {
      // Prefer the user associated with the unit, fallback to logged in user (e.g. admin or owner creating for themselves)
      let oid = userIdForUnit || (loggedInUser ? loggedInUser._id : null);
      let cbt = "other";
      if (createdfrom === "ownervehicles") {
        cbt = "owner";
      } else {
        if (vehcbt === "owner") {
          cbt = "owner";
        }
      }



      const vehiclePayload = {
        ...formData,
        hoaid: hoaId,
        ownerid: oid,
        requires_payment: rpflag,
        createdbytype: cbt

        // ...(!isModifyMode && {
        //   pin_code_value: createdfrom === "rentervehicles" ? pincodeValue : "",
        //   pin_code_action: createdfrom === "rentervehicles" ? pincodeAction : "standard"
        // })
      };

      //  console.log('VD THE VEHICLE CREATION PAYLOAD IS ',vehiclePayload)

      if (isModifyMode) {
        // console.log('we are modifying a vehicle')
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
      const errorMessage = err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        err.message;

      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: `Error ${isModifyMode ? "updating" : "creating"} vehicle: ${errorMessage}`,
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
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
    backgroundImage = getAWSResource(hoa, 'BI');
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
          <h2 style={{ color: "#333", marginTop: 0, marginBottom: "10px" }}>
            {pageTitle}
          </h2>
          <form onSubmit={handleFormSubmit}>
            <div className="vehicle-details-grid">
              {/* Owner Information */}


              {/* <h3 style={{ color: "#1976d2", margin: "10px" }}>Owner</h3> */}
              <fieldset className="input-group">
                <legend style={{ color: "#1976d2", marginBottom: "5px" }}><b>Owner</b></legend>

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
                  <label className="input-label">
                    Parking Type
                  </label>


                  {createdfrom === "rentervehicles" && (
                    // <div style={{ fontWeight: "bold" }}>
                    //   <input className="standardinput"
                    //     type="text"
                    //     name="carownertype"
                    //     value={formData.carownertype}
                    //     disabled
                    //   />
                    // </div>
                    <div style={{ fontWeight: "normal" }}>
                      <div style={{ marginLeft: "12px", marginTop: "15px" }}>
                        {formData.carownertype?.toUpperCase()}
                      </div>

                    </div>
                  )
                  }
                  {createdfrom !== "rentervehicles" && (
                    <select
                      className="standardselect100"
                      name="carownertype"
                      value={formData.carownertype || vehicleOwnerTypeAry[0]}
                      onChange={handleFormChange}
                      disabled={isModifyMode || createdfrom === "rentervehicles"}
                    >
                      <option value="" disabled>Select owner type</option>
                      {vehicleOwnerTypeAry.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  )
                  }






                </div>


              </fieldset>



              {/* <h3 style={{ color: "#1976d2", margin: "10px" }}>Registration</h3> */}
              <fieldset className="input-group">
                <legend style={{ color: "#1976d2", marginBottom: "5px" }}><b>Registration</b></legend>




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
                    Plate State *
                  </label>

                  <input className="standardinput"
                    type="text"
                    maxLength={2}
                    name="plate_state"
                    value={formData.plate_state}
                    onChange={handleFormChange}
                    placeholder="e.g., CO, CA, TX"
                    required
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label className="input-label">
                    Vehicle Type
                  </label>

                  <select className="standardselect100"
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleFormChange}
                  // style={{
                  //   width: "100%",
                  //   padding: "10px",
                  //   borderRadius: "4px",
                  //   border: "1px solid #ccc",
                  //   boxSizing: "border-box"
                  // }}

                  >
                    <option value="">Select Type</option>
                    <option value="Car">Car</option>
                    <option value="Truck">Truck</option>
                    <option value="RV">RV</option>
                    <option value="Motorcyle">Motorcyle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label className="input-label">
                    Unit
                  </label>

                  <input className="standardinput"
                    type="text"
                    name="unitnumber"
                    value={formData.unitnumber}
                    onChange={handleFormChange}
                    disabled
                  />
                </div>

              </fieldset>





              {/* License Plate & Status */}
              {/* <h3 style={{ color: "#1976d2", margin: "10px" }}>Vehicle</h3> */}


              <fieldset className="input-group">
                <legend style={{ color: "#1976d2", marginBottom: "5px" }}><b>Vehicle</b></legend>




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
                    Color
                  </label>

                  <input className="standardinput"
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleFormChange}
                  />
                </div>

                <div style={{ marginBottom: "0px" }}>
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

              </fieldset>



              {/* Vehicle Information */}

              <fieldset className="input-group">
                <legend style={{ color: "#1976d2", marginBottom: "5px" }}><b>Stay</b></legend>



                <div style={{ marginBottom: "15px" }}>
                  <label className="input-label">
                    Check In
                  </label>

                  <input className="input-date2"
                    type="date"
                    name="startdate"
                    // value={new Date(formData.startdate).toISOString().substring(0, 10)}
                    value={formData.startdate}
                    onChange={handleFormChange}
                    disabled={disableInDateField}
                  />
                </div>



                <div style={{ marginBottom: "15px" }}>
                  <label className="input-label">
                    Check Out
                  </label>
                  <input className="input-date2"
                    type="date"
                    name="enddate"
                    value={formData.enddate}
                    onChange={handleFormChange}
                    disabled={disableOutDateField}
                  />
                </div>

                <div style={{ marginBottom: "15px", display: "invisible" }}>
                  <label className="input-label" htmlFor="vehicle-pin-code">
                    PIN Code
                  </label>
                  <input className="standardinput"
                    id="vehicle-pin-code"
                    type="text"
                    value={isModifyMode ? vehicle?.pin_code_value ?? "" : createdfrom === "rentervehicles" ? pincodeValue ?? "" : ""}
                    readOnly
                    disabled
                  />
                </div>

                <div>
                  <label className="input-label" htmlFor="vehicle-pin-action">
                    PIN Code Action
                  </label>
                  <input className="standardinput"
                    id="vehicle-pin-action"
                    type="text"
                    value={isModifyMode ? vehicle?.pin_code_action ?? "" : createdfrom === "rentervehicles" ? pincodeAction ?? "" : "standard"}
                    readOnly
                    disabled
                  />
                </div>
              </fieldset>





            </div>

            {/* JJVFIX  check box disabled*/}

            <div style={{ marginTop: "20px" }}>


              <div className="unit-checkbox-row">
                <input
                  type="checkbox"
                  id="vehicle-day-use-only"
                  name="day_use_only"
                  checked={formData.day_use_only === 1}
                  onChange={handleFormChange}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  disabled={true}

                />
                <label className="input-label" htmlFor="vehicle-day-use-only">Day use only</label>
              </div>

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
                  {role === 'owner' ? (
                    <a href={getAWSResource(hoa, 'OTC')} target="_blank" rel="noopener noreferrer">
                      Terms and Conditions
                    </a>
                  ) : (
                    <a href={getAWSResource(hoa, 'RTC')} target="_blank" rel="noopener noreferrer">
                      Terms and Conditions
                    </a>
                  )}

                </label>

                {/* <a href={getAWSResource(hoa, 'OTC')} target="_blank" rel="noopener noreferrer">
                  View Terms and Conditions directly
                </a> */}

              </div>


              {/* <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
              </div> */}

              <div className="button-grid">
                <button className="btn btn-primary"
                  type="submit"
                  disabled={formSubmitting || !termsAcknowledged}
                >
                  {formSubmitting ? (isModifyMode ? "Updating..." : "Creating...") : (isModifyMode ? "Update" : "Create")}
                </button>

                <button className="btn btn-cancel"
                  type="button"
                  onClick={handleBackClick}
                >
                  Cancel
                </button>
                {isModifyMode && localStorage.getItem('logonType') !== 'tenant' && (
                  <button className="btn btn-danger"
                    type="button"

                    onClick={handleDeleteClick}
                    disabled={formSubmitting || !termsAcknowledged}
                  >
                    Delete
                  </button>
                )}
              </div>





              {/* <div className="button-grid">
                <button>one</button>
                <button>two</button>
                <button>three</button>
              </div> */}
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

      {/* <PlateLookup
        isOpen={isPlateLookupOpen}
        onClose={() => setIsPlateLookupOpen(false)}
        onPlateDetected={handlePlateDetected}
      /> */}
    </div>
  );
}

/*
  <button
                    type="button"
                    onClick={() => setIsPlateLookupOpen(true)}
                    style={{
                      padding: "5px 10px",
                      fontSize: "12px",
                      backgroundColor: "#1976d2",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginTop: "5px",

                    }}
                  >
                    Lookup Plate
                  </button>
                  */
