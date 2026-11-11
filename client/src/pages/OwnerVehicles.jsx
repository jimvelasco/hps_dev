import React, { use, useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import { useLoggedInUser } from "../hooks/useLoggedInUser";
import axios from "../services/api";
import DashboardNavbar from "../components/DashboardNavbar";
import VehiclesGridPhone from "../components/VehiclesGridPhone";
import VehiclesTableUpdate from "../components/VehiclesTableUpdate";
import { getVehicleActiveStatusBoolean, utcDateOnly, daypassVehicleCount, anyDaypassVehicleCount, getVehicleTypeGroups } from "../utils/vehicleHelpers";
import { doesUnitHaveDayUse } from "../utils/unitHelpers";
import ModalAlert from "../components/ModalAlert";
import { getAWSResource } from "../utils/awsHelper";


export default function OwnerVehicles() {
  const { hoaId ,role:routeRole} = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState(null);
  const [sortColumn, setSortColumn] = useState("plate");
  const [sortDirection, setSortDirection] = useState("asc");
  const { user: loggedInUser, loading: userLoading, clearLoggedInUser } = useLoggedInUser();
  const [role, setRole] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [filterType, setFilterType] = useState("owner");
  const [plateSearch, setPlateSearch] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [allRawVehicles, setAllRawVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [allActiveCount, setAllActiveCount] = useState(0);
  const [allActiveVehicles, setAllActiveVehicles] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null, onCancel: null });
  const [showTable, setShowTable] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showUnitId, setShowUnitId] = useState("");
  const [unitForOwner, setUnitForOwner] = useState(null);
  const [logonType, setLogonType] = useState("owner");
  const [activeVehicles, setActiveVehicles] = useState(0);
  const [disableAddButton, setDisableAddButton] = useState(false);
  const [maxDaypassTemplates, setMaxDaypassTemplates] = useState(2);

  // these are vehicle types that will show up on this page
  const [vehicleOwnerTypeAry, setVehicleOwnerTypeArray] =
    useState(['owner', 'tenant', 'family', 'friend', 'visitor', 'contractor']);




  useEffect(() => {
    if (userLoading) {
      return; // Still loading, wait
    }
    // console.log("Token:", localStorage.getItem("token"));
    if (loggedInUser) {
      setRole(loggedInUser.role);
      setOwnerId(loggedInUser._id);
      setShowUnitId(loggedInUser.unitnumber);
      setLogonType(localStorage.getItem('logonType'));
    //  console.log('OV role from url',routeRole, loggedInUser.role)
     if (localStorage.getItem('logonType') === 'rentalmanager') {
      setDisableAddButton(true)
     }


    } else {
      console.log("owner vehicles loggedInUser is null")
    }
  }, [loggedInUser, userLoading]);

  useEffect(() => {
    if (userLoading || !hoaId || !loggedInUser?.unitnumber) {
      setUnitForOwner(null);
      return;
    }

    let cancelled = false;
    const fetchUnit = async () => {
      try {
        const response = await axios.get(`/units/${encodeURIComponent(hoaId)}/${encodeURIComponent(loggedInUser.unitnumber)}`);
        if (!cancelled) {
          setUnitForOwner(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setUnitForOwner(null);
          console.error("Error fetching unit:", err);
        }
      }
    };

    fetchUnit();
    return () => { cancelled = true; };
  }, [hoaId, userLoading, loggedInUser?.unitnumber]);

  useEffect(() => {
    if (userLoading) {
      return; // Still loading, wait
    }
    let qry = "";
    if (hoaId) {
      const fetchVehicles = async () => {
        try {
          setVehiclesLoading(true);

          // we get all vehicles for the unit not just the ownerid
          qry = `/vehicles/${hoaId}/allvehicles/${showUnitId}`
          //   console.log("OwnerVehicles.jsx qry:", qry);
          if (role === "admin") {
            qry = `/vehicles/adminvehicles/${hoaId}`
          }

          const response = await axios.get(qry);
          const today = new Date().toLocaleDateString("en-CA");
          const responseData = response.data;

          //     console.log('ALL VEHICLES IN UNIT',responseData);

          // const updatedVehicles = responseData.filter(v => {
          //   return v.carownertype !== 'renter';
          // }).map(v => ({
          //   ...v,
          //   calculatedActiveFlag: getVehicleActiveStatusBoolean(v)
          // }));

          const rawvehicles = responseData.filter(v => {
            return true; //v.carownertype !== 'renter';
          }).map(v => ({
            ...v,
            calculatedActiveFlag: getVehicleActiveStatusBoolean(v)
          }));

          setAllRawVehicles(rawvehicles);

        //  console.log('rawvehicles', rawvehicles);
          let gpa = getVehicleTypeGroups(rawvehicles);
       //  console.log('gpa', gpa)

          let activeVehicles = rawvehicles.filter(v => v.calculatedActiveFlag === true);
          //   console.log('activeVehicles', activeVehicles);
          setAllActiveCount(activeVehicles.length);
          setAllActiveVehicles(activeVehicles);

          //JJVFIX. do not show tenants

          // const updatedVehicles = rawvehicles.filter(v => v.carownertype !== "renter" && v.carownertype !== "tenant" );
         // const updatedVehicles = rawvehicles.filter(v => v.carownertype !== "renter");
          const updatedVehicles = [...rawvehicles];

          // console.log('OV 148 updatedVehicles THESE ARE carowner type != renter', updatedVehicles);

          //   setAllVehicles(updatedVehicles);



          // console.log('updatedVehicles vehicles', updatedVehicles);
          let updatedVehicles2 = [...updatedVehicles];

          //    console.log('updatedVehicles2', role, updatedVehicles2);

          if (role === 'tenant') {
         //   console.log('updated vehicles2',updatedVehicles2)
            updatedVehicles2 = updatedVehicles.filter(v => v.carownertype === "tenant" || v.carownertype === "friend" );
           //  console.log('updated vehicles2 after filter',updatedVehicles2)
          }

          let updatedVehicles3 = [...updatedVehicles2]

          //  console.log('OV 165 updatedVehicles3', updatedVehicles3);

          let updatedVehicles4 = updatedVehicles3.filter(v => v.calculatedActiveFlag === true);

          //   console.log('OV 169 updatedVehicles4', updatedVehicles4);

          setActiveVehicles(updatedVehicles3);
          // keep vehicles in order
          // updatedVehicles2.sort((a, b) => {
          //   let valueA, valueB;
          //   valueA = a.calculatedActiveFlag || "";
          //   valueB = b.calculatedActiveFlag || "";
          //   return String(valueB).localeCompare(String(valueA));
          // });

          // console.log('updatedVehicles3', updatedVehicles3);
          // console.log('WE ARE ABOUT TO SET-ALL-VEHICLES updatedVehicles.  these are vehicles sans renter.  FOR NOW USE RAWVEHICLES',rawvehicles)

          //  setAllVehicles(updatedVehicles);
          setAllVehicles(rawvehicles);
          setVehiclesError(null);
        } catch (err) {
          setVehiclesError(err.message || "Failed to load vehicles");
          //  console.error("Error fetching vehicles:", err);
        } finally {
          setVehiclesLoading(false);
        }
      };

      fetchVehicles();
    }
  }, [hoaId, ownerId, role]);

  const handleFilterApply = () => {
 //  console.log('WE CALLED FILTER APPLY')
    let matchingVehicles = [...allVehicles];
    if (filterType === "owner") {
           return matchingVehicles.filter(v => v.createdbytype === 'owner');
    }
    if (filterType === "other") {
      //return matchingVehicles.filter(v => v.carownertype === "renter");
      return matchingVehicles.filter(v => v.createdbytype === 'other');
    }
    if (filterType === "dayuse") {
      //return matchingVehicles.filter(v => v.carownertype === "renter");
      return matchingVehicles.filter(v => v.day_use_only === 1);
    }
    if (filterType === "all") {
      return matchingVehicles;
    }
    // return matchingVehicles;
  };

  const unitQuery = unitSearch.trim().toLowerCase();
  const plateQuery = plateSearch.trim().toLowerCase();
  // JJVFIX not sure what happens here not filtering out renters for admin
  // this will not show the renter vehicles in the display

  

  const filteredVehicles = loggedInUser?.role === "admin"
    ? vehicles.filter(vehicle =>
      String(vehicle.plate ?? "").toLowerCase().includes(plateQuery) &&
      String(vehicle.unitnumber ?? "").toLowerCase().includes(unitQuery)
    )
    : loggedInUser?.role === "tenant"
      ? vehicles.filter(v => v.createdbyrole === "tenant" || v.carownertype === "tenant")
      : loggedInUser?.role === "rentalmanager" 
      ? vehicles.filter(v => v.carownertype !== "renter"  &&  v.createdbyrole !== "tenant" &&  v.createdbyrole !== "")
      :  vehicles.filter(v => v.carownertype !== "renter"  &&  v.createdbyrole !== "tenant" &&  v.createdbyrole !== "");


    //    const filteredVehicles = loggedInUser?.role === "admin"
    // ? vehicles.filter(vehicle =>
    //   String(vehicle.plate ?? "").toLowerCase().includes(plateQuery) &&
    //   String(vehicle.unitnumber ?? "").toLowerCase().includes(unitQuery)
    // )
    // : loggedInUser?.role === "tenant"
    //   ? vehicles.filter(v => v.createdbyrole === "tenant")
    //   : vehicles.filter(v => v.carownertype !== "renter");

  //console.log('filtered vehicles should be all of them in vehicles sans the renter vehicles', filteredVehicles)

  // useEffect(() => {
  //   setVehicles(handleFilterApply(allVehicles));
  // }, [allVehicles, filterType]);
  //? vehicles.filter(v => v.carownertype === "tenant" ||  v.createdbyrole === "tenant")
  //: vehicles.filter(v => v.carownertype !== "renter" && v.createdbyrole !== "tenant" &&  v.createdbytype !== "other");
  //&&  v.createdbyrole !== "tenant"
  // &&  v.createdbyrole !== "tenant" &&  v.createdbyrole !== ""

  // for default use
  //   &&  v.createdbyrole !== "tenant" &&  v.createdbyrole !== ""
  //filter(v => v.carownertype !== "renter")

  useEffect(() => {
    setVehicles(allVehicles);
  }, [allVehicles]);




  if (loading) {
    return <div style={{ padding: "20px" }}>Loading Vehicle data...</div>;
  }

  if (error) {
    setAppError(error);
    navigate(`/${hoaId}/error`);
    return null;
  }

  const handleBackToDashboard = () => {
    navigate(`/${hoaId}/dashboard`);
  };

  const handleSort = (column) => {
    let newDirection = "asc";
    if (sortColumn === column && sortDirection === "asc") {
      newDirection = "desc";
    }
    setSortColumn(column);
    setSortDirection(newDirection);
    const sorted = [...vehicles].sort((a, b) => {
      let valueA, valueB;
      if (column === "plate") {
        valueA = (a.plate || "").toLowerCase();
        valueB = (b.plate || "").toLowerCase();
      } else if (column === "owner") {
        valueA = (a.carowner_lname || "").toLowerCase();
        valueB = (b.carowner_lname || "").toLowerCase();
      } else if (column === "ownertype") {
        valueA = (a.carownertype || "").toLowerCase();
        valueB = (b.carownertype || "").toLowerCase();
      }
      else if (column === "unit") {
        valueA = (a.unitnumber || "").toLowerCase();
        valueB = (b.unitnumber || "").toLowerCase();
      }
      else if (column === "enddate") {
        valueA = (a.enddate || "").toLowerCase();
        valueB = (b.enddate || "").toLowerCase();
      } else if (column === "active") {
        valueA = a.calculatedActiveFlag || "";
        valueB = b.calculatedActiveFlag || "";
      }
      if (newDirection === "asc") {
        return String(valueA).localeCompare(String(valueB));
      } else {
        return String(valueB).localeCompare(String(valueA));
      }
    });
    setVehicles(sorted);
  };

  const handleDetailsClick = async (vehicle) => {

    const vid = vehicle._id;
    const uid = vehicle.unitnumber;

    try {

      //  console.log('ov handle details click vehicle:', vehicle.carownertype);
      // editing allowed for all
      if (vehicle.carownertype === "renter" && loggedInUser.role !== "admin") {
        setModal({
          isOpen: true,
          type: "alert",
          title: "Validation Error",
          message: `Owners cannot modify renter vehicles.`,
          confirmText: "OK",
          onConfirm: () => {
            setModal(prev => ({ ...prev, isOpen: false }));
          },
        });
        return;
      }

      //  if (loggedInUser.role === "rentalmanager") {
      //   setModal({
      //     isOpen: true,
      //     type: "alert",
      //     title: "Validation Error",
      //     message: `Rental Managers cannot modify vehicles.`,
      //     confirmText: "OK",
      //     onConfirm: () => {
      //       setModal(prev => ({ ...prev, isOpen: false }));
      //     },
      //   });
      //   return;
      // }

      const qry = `/${hoaId}/vehicledetails/modify/${vid}`;
      // console.log("ownervehicles.js handleDetailsClick clicked qry", qry);
      let unitNumber = uid; //loggedInUser ? loggedInUser.unitnumber : "999999999999";
      let arole = "owner";


      navigate(qry, {
        state: {
          nonownerType: vehicle.carownertype,
          unitNumber: unitNumber,
          role: loggedInUser.role,

          vehicles: vehicles,
          ownerOfUnit: loggedInUser,
          vehid: vid,
          unit: unitForOwner,
          carownertype: vehicle.carownertype,
          pincodeAction: "",
          createdfrom: "ownervehicles",

        }
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: err.response?.data?.message || err.message || "Failed to load unit inventory limit.",
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
    }
    //vid } });
    //navigate(qry);
  };






  const handleCreateClick = async (pin_code_action) => {

    pin_code_action = "";

    const veh_grp_ary = getVehicleTypeGroups(vehicles);

    const maxdaypasstemplates = 2;

    const uid = loggedInUser?.unitnumber;
    if (!hoaId || !uid) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: "Unable to determine the unit for this user.",
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }
    if (veh_grp_ary.dayusemultivehsany.count >= maxDaypassTemplates) {
       setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: "You can only have 2 day pass templates.",
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
      return;

    }

      // if (loggedInUser.role === "rentalmanager") {
      //   setModal({
      //     isOpen: true,
      //     type: "alert",
      //     title: "Validation Error",
      //     message: `Rental Managers cannot add vehicles.`,
      //     confirmText: "OK",
      //     onConfirm: () => {
      //       setModal(prev => ({ ...prev, isOpen: false }));
      //     },
      //   });
      //   return;
      // }

    try {
      const response = await axios.get(`/units/${encodeURIComponent(hoaId)}/${encodeURIComponent(uid)}`);
      const unit = response.data;
      if (!unit) {
        const contact = hoa?.contact_information?.find(item => item.contact_id === "pm_renter");
        const contactDetails = [contact?.phone_description, contact?.phone_number, contact?.email].filter(Boolean).join(" ** ");
        //  const contactDetails = [contact?.phone_description, contact?.phone_number, contact?.email].filter(Boolean);
        let cstr = "";
        // contactDetails.forEach(element => {
        //   cstr += element + "<br />";

        // });
        setModal({
          isOpen: true,
          type: "alert",
          title: "Unit Not Found",
          message: <>Your unit is not registered for this HOA.<br />Please contact {contactDetails || "your property manager"}.</>,
          confirmText: "OK",
          onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
        });
        return;
      }

      setUnitForOwner(unit);
      let parkingLimitInventory = Number(unit.inventory_allowed_owner);
      let unitParkingLimit = Number(unit.parking_allowed_unit);


      // const dayuseok = doesUnitHaveDayUse(unit);

      // this will get all the count all the ACTIVE daypass vehicles 
      const daypassCount = daypassVehicleCount(allVehicles);
   //   console.log('function daypassVehicleCount', daypassCount);
   //   console.log('grp ary dayusemultivehs', veh_grp_ary.dayusemultivehs.count);

      // this counts all vehicles with a daypass that are active or inactive
      const anydaypassCount = anyDaypassVehicleCount(allVehicles);

      // console.log('vehicles in owner vehicles 414',vehicles)
      // console.log('vehicles in owner allVehicles 414',allVehicles)


      //JJVFIX

      // if (daypassCount > 0) {
      parkingLimitInventory += daypassCount;
      //  }



      let msg = (<>Vehicle limit reached. <br /> You may only have <br />{parkingLimitInventory} vehicles in your inventory.</>);

    //  console.log('entire inventory is ',veh_grp_ary.nonownervehsany.count)

      if (vehicles.length >= parkingLimitInventory) {
        setModal({
          isOpen: true,
          type: "alert",
          title: "Validation Error",
          message: msg,
          confirmText: "OK",
          onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
        });
        return;
      }


      navigate(`/${hoaId}/vehicledetails/create/${uid}`, {
        state: {
          nonownerType: 'owner',
          unitNumber: uid,
          role: loggedInUser.role,
          vehicles: vehicles,
          ownerOfUnit: loggedInUser,
          vehid: '',
          unit: unit,
          carownertype: '',

          // numberOfVehicles: vehicles.length,
          createdfrom: 'ownervehicles',
          pincodeValue: '',
          pincodeAction: pin_code_action
        }
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: err.response?.data?.message || err.message || "Failed to load unit inventory limit.",
        confirmText: "OK",
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
    }
  };
  const handlePaymentClick = (vehicle) => {
    console.log("Payment click for vehicle id:", vehicle._id);
    if (vehicle.carownertype === "renter") {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: `Owners cannot modify renter vehicles.`,
        confirmText: "OK",
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
        },
      });
      return;
    }

    navigate(`/${hoaId}/payment`, {
      state: {
        vehicleId: vehicle._id,
        unitNumber: loggedInUser.unitnumber, userId: ownerId, hoaId: hoaId, role: "owner"
      }
    });

  }
  const handleShowHidenClick = () => {
    setIsVisible(!isVisible)
  }
  const handleShowFilterClick = () => {
    setShowFilters(!showFilters)
  }
  // const handleShowTableClick = () => {
  //   setShowVisible(!isVisible)
  // }

  const handleShowTable = () => {
    if (showTable) {
      setShowTable(false)
    } else {
      setShowTable(true)
    }
  };

  const navButtons = [
    {
      label: "Dashboard",
      onClick: handleBackToDashboard,
      which: "goback"
    }
  ];
  let backgroundImage = '';
  let ttitle2 = "";
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
    // ttitle2 = hoa.name + " -  " + role;
    ttitle2 = hoa.name;
    // console.log("VEHICLES LENGTH IS ",vehicles.length );
  }

  let titlestr = "Owner Vehicles " + localStorage.getItem('unitNumber');
  if (role === "admin") {
    titlestr = "Admininistrator All Vehicles";
  } else if (role === "rentalmanager") {
     titlestr = "Rental Manager Vehicles "  + localStorage.getItem('unitNumber');
  } else if (role === "tenant") {
     titlestr = "Tenant Vehicles " + localStorage.getItem('unitNumber');
  }


  const renderTitleBarTable = () => {
    return (<div >
      
      <div className="button-grid">
        {loggedInUser && loggedInUser.role === "admin" && (
          <>
            <div>
              <select className="standardselect"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="owner">Owner</option>
                <option value="other">Non-Owner</option>
                <option value="dayuse">Day Use</option>
                <option value="all">All</option>
              </select>


            </div>
            <div>
              <button className="navbutton4" style={{marginLeft:"-90px"}}
                onClick={() => setVehicles(handleFilterApply())}>
                Filter
              </button>

            </div>
          </>

        )}
      

        {loggedInUser && loggedInUser.role !== "admin" && (
          <>
            <button className="navbutton3"
              onClick={() => handleCreateClick('standard')}
              disabled = {disableAddButton}>
              <FontAwesomeIcon
                icon={faPlus}
              />  Add Vehicle
            </button>
            {/* <button className="navbutton3"
              onClick={() => handleCreateClick('daypass')}>
              <FontAwesomeIcon
                icon={faPlus}
              />  Add Day Pass
            </button> */}
          </>
        )}

        <button className="navbutton3"
          onClick={handleShowFilterClick}>
          {showFilters ?
            (<span className="strike">
              Sort</span>)
            : (<span>Sort</span>)
          }
        </button>
        <button className="navbutton3"
          onClick={handleShowTable}>
          {showTable ?
            (<span className="strike">
              Table</span>)
            : (<span>Table</span>)
          }
        </button>
      </div>
    </div>)
  }


  const renderTitleBarPhone = () => {
    return (<div>
      <div className="button-grid">
        {loggedInUser && loggedInUser.role === "admin" && (
          <>
            <div >
              <select className="standardselect"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="owner">Owner</option>
                <option value="other">Non-Owner</option>
                <option value="dayuse">Day Use</option>
                <option value="all">All</option>
              </select>

            </div>
            <div>
              <button className="navbutton3"
                onClick={() => setVehicles(handleFilterApply())}>
                Filter
              </button>

            </div>
          </>
        )}
      </div>

      {loggedInUser && loggedInUser.role !== "admin" && (
        <div className="button-grid">

          <button className="navbutton3"
            onClick={() => handleCreateClick('standard')}>
            <FontAwesomeIcon
              icon={faPlus}
            />  Add Vehicle
          </button>
          {/* <button className="navbutton3"
            onClick={() => handleCreateClick('daypass')}>
            <FontAwesomeIcon
              icon={faPlus}
            />  Add Day Pass
          </button> */}
        </div>
      )}


      <div className="button-grid">
        <button className="navbutton3"
          onClick={handleShowFilterClick}>
          {showFilters ?
            (<span className="strike">
              Sort</span>)
            : (<span>Sort</span>)
          }
        </button>
        <div>
          <button className="navbutton3"
            onClick={handleShowTable}>
            {showTable ?
              (<span className="strike">
                Table</span>)
              : (<span>Table</span>)
            }
          </button>
        </div>
      </div>




    </div>
    )
  }

  // const renderPlateSearch = () => {
  //   return (

  //   );
  // };


  return (
    <div style={{ minHeight: "100vh", backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <DashboardNavbar title={titlestr} title2={ttitle2} buttons={navButtons} />
      <div className="page-content">




        <div className="tableview">
          <div className="standardtitlebar800" style={{ border: "0px solid yellow " }}>
            {renderTitleBarTable()}
          </div>
        </div>
        <div className="phoneview">
          <div className="standardtitlebar320" style={{ border: "0px solid yellow " }}>
            {renderTitleBarPhone()}
          </div>
        </div>

        {loggedInUser?.role === "admin" && (
          <>
            <div className="standardtitlebar380" style={{ width: "300px" }}>
              <label className="search-label" htmlFor="unit-search" style={{ marginRight: "10px" }}>Unit</label>
              <input
                id="unit-search"
                className="standardinput plate-search-input"
                type="search"
                value={unitSearch}
                onChange={(event) => setUnitSearch(event.target.value)}
                placeholder="Enter unit number"
              />
            </div>
            <div className="standardtitlebar380" style={{ width: "300px" }}>
              <label className="search-label" htmlFor="plate-search" style={{ marginRight: "10px" }}>Plate</label>
              <input
                id="plate-search"
                className="standardinput plate-search-input"
                type="search"
                value={plateSearch}
                onChange={(event) => setPlateSearch(event.target.value)}
                placeholder="Enter license plate"
              />
            </div>
          </>
        )}




        {/* for testing <div className="phoneview">
          <div className="standardtitlebar800" style={{ border: "0px solid yellow " }}>
            {renderTitleBarTable()}
          </div>
        </div>
        <div className="tableview">
          <div className="standardtitlebar320" style={{ border: "0px solid yellow " }}>
            {renderTitleBarPhone()}
          </div>
        </div> */}


        <div style={{ display: isVisible ? "block" : "block" }}>



          {showFilters && (
            // <div className="standardtitlebar" style={{backgroundColor: "transparent"}}>
            //   <div className="button-grid">
            //     <button className="btnxs btn-primary btn-sort"
            //       onClick={() => handleSort("owner")}>
            //       Name
            //     </button>
            //     <button className="btnxsp btn-sort"
            //       onClick={() => handleSort("unit")}>
            //       Unit
            //     </button>
            //     <button className="btnxsp btn-sort "
            //       onClick={() => handleSort("ownertype")}>
            //       Type
            //     </button>
            //     <button className="btnxsp btn-sort"
            //       onClick={() => handleSort("plate")}>
            //       Plate
            //     </button>
            //     <button className="btnxsp btn-sort "
            //       onClick={() => handleSort("enddate")}>
            //       Checkout
            //     </button>
            //     <button className="btnxsp btn-sort "
            //       onClick={() => handleSort("active")}>
            //       Active
            //     </button>
            //   </div>
            // </div>  style={{backgroundColor: "transparent"}}
             <div className="standardtitlebar800">
              <div className="button-grid">
                <button className="navbutton4"
                  onClick={() => handleSort("owner")}>
                  Name
                </button>
                <button className="navbutton4"
                  onClick={() => handleSort("unit")}>
                  Unit
                </button>
                <button className="navbutton4 "
                  onClick={() => handleSort("ownertype")}>
                  Type
                </button>
                <button className="navbutton4"
                  onClick={() => handleSort("plate")}>
                  Plate
                </button>
                <button className="navbutton4 "
                  onClick={() => handleSort("enddate")}>
                  Checkout
                </button>
                <button className="navbutton4 "
                  onClick={() => handleSort("active")}>
                  Active
                </button>
              </div>
            </div>
          )}

        </div>
        {/* <div className="standardtitlebar2">
          <span><b>Vehicle List</b></span>
          
        </div> */}





        {vehiclesError && (
          <div className="displayerror">
            <p><strong>Error:</strong> {vehiclesError}</p>


          </div>
        )}

        {vehiclesLoading ? (
          <div className="ajaxloading">
            <p style={{ color: "#666" }}>Loading vehicles...</p>
          </div>
        ) : filteredVehicles.length > 0 ? (
          <>

            {showTable ? (
              <div style={{ overflowX: "auto", maxWidth: "100%" }}>
                <div style={{
                  minWidth: "800px",
                  overflowX: "auto"
                }}>

                  <div className='grid-flex-container'>
                    <VehiclesTableUpdate
                      vehicles={filteredVehicles}
                      role={role}
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      handleSort={handleSort}
                      handleDetailsClick={handleDetailsClick}
                      handlePaymentClick={handlePaymentClick}
                      getVehicleActiveStatusBoolean={getVehicleActiveStatusBoolean}
                      utcDateOnly={utcDateOnly}
                    />
                  </div>
                </div>
              </div>

            ) :

              (

                <div className='grid-flex-container'>

                  <VehiclesGridPhone
                    vehicles={filteredVehicles}
                    role={role}

                    handleDetailsClick={handleDetailsClick}
                    handlePaymentClick={handlePaymentClick}
                    getVehicleActiveStatusBoolean={getVehicleActiveStatusBoolean}
                    utcDateOnly={utcDateOnly}
                  />
                </div>
              )


            }
          </>
        ) : (
          <div className="noresultsfound">
            <p style={{ color: "#666", fontWeight: "bold", textAlign: "center" }}>
              {unitQuery && loggedInUser?.role === "admin" ? "No matching units found." : "No vehicles found."}
            </p>
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

// selectstyle={{
//               padding: "8px 12px",
//               borderRadius: "4px",
//               border: "1px solid #ccc",
//               fontSize: "14px",
//               cursor: "pointer"
//             }}

// onMouseEnter={(e) => e.target.style.backgroundColor = "#388e3c"}
// onMouseLeave={(e) => e.target.style.backgroundColor = "#4caf50"}

// style={{ padding: "8px 16px"}}
// style={{
//   padding: "8px 16px",
//   fontSize: "14px",
//   backgroundColor: "#4caf50",
//   color: "white",
//   border: "none",
//   borderRadius: "4px",
//   cursor: "pointer",
//   fontWeight: "bold",
//   transition: "background-color 0.3s ease"
// }}
