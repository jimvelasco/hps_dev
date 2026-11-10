import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../services/api";
import { useHoa } from "../context/HoaContext";
import { getAWSResource } from "../utils/awsHelper";
import DashboardNavbar from "../components/DashboardNavbar";
import { useLoggedInUser } from "../hooks/useLoggedInUser";


export default function UsersForUnit() {
  const navigate = useNavigate();
  const { hoaId, unitNumber } = useParams();
  const { hoa, fetchHoaById } = useHoa();
  const { user: loggedInUser, loading: userLoading } = useLoggedInUser();
  const canAccess = loggedInUser?.hoaid === hoaId && (
    loggedInUser.role === "admin" ||
    (loggedInUser.role === "owner" && loggedInUser.unitnumber === unitNumber)
  );
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(null);

  useEffect(() => {
    if (hoaId && hoa?.hoaid !== hoaId) fetchHoaById(hoaId);
  }, [hoaId, hoa?.hoaid, fetchHoaById]);

  useEffect(() => {
    if (!hoaId || !unitNumber || !canAccess) return;
    let active = true;
    setLoadingUsers(true);
    setUsersError(null);
    axios.get("/users", { params: { hoaId } })
      .then(response => {
        if (active) {
          setUsers(response.data.filter(user => user.hoaid === hoaId && user.unitnumber === unitNumber));
        }
      })
      .catch(error => {
        if (active) setUsersError(error.response?.data?.message || "Failed to load users for this unit.");
      })
      .finally(() => {
        if (active) setLoadingUsers(false);
      });
    return () => {
      active = false;
    };
  }, [hoaId, unitNumber, canAccess]);

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



  if (!hoa) {
    return null
  } else {
    return (
      <div style={{
        minHeight: "100vh", backgroundColor: "#f5f5f5",
        backgroundImage: `url('${backgroundImage}')`, backgroundSize: "cover",
        backgroundPosition: "center", backgroundAttachment: "fixed"
      }}>
         <DashboardNavbar title="Users for Unit" title2={hoa && hoa.name} buttons={navButtons} />

        <div className="page-content users-for-unit-page">
          <div className="standardtitlebar800">
            <h3>Users for Unit {unitNumber}</h3>
          </div>
          {userLoading ? (
            <p className="ajaxloader" role="status">Loading your account...</p>
          ) : !canAccess ? (
            <p className="displayerror" role="alert">You do not have permission to view users for this unit.</p>
          ) : loadingUsers ? (
            <p className="ajaxloader" role="status">Loading users...</p>
          ) : usersError ? (
            <p className="displayerror" role="alert">{usersError}</p>
          ) : users.length === 0 ? (
            <p className="ajaxloader">No users found for this unit.</p>
          ) : (
            <div className="users-for-unit-grid">
              {users.map(user => (
                <article className="grid-container-3_oldhoa users-for-unit-card" key={user._id}>
                  <dl className="full-row users-for-unit-details">
                    <dt className="grid-item-bold">First Name</dt>
                    <dd className="grid-item-normal">{user.first_name || "—"}</dd>
                    <dt className="grid-item-bold">Last Name</dt>
                    <dd className="grid-item-normal">{user.last_name || "—"}</dd>
                    <dt className="grid-item-bold">Email</dt>
                    <dd className="grid-item-normal">{user.email || "—"}</dd>
                    <dt className="grid-item-bold">Phone</dt>
                    <dd className="grid-item-normal">{user.phone || "—"}</dd>
                    <dt className="grid-item-bold">Role</dt>
                    <dd className="grid-item-normal">{user.role || "—"}</dd>
                    <dt className="grid-item-bold">Company</dt>
                    <dd className="grid-item-normal">{user.company || "—"}</dd>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
  );
  }
}
