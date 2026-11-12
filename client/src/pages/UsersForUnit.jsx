import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../services/api";
import { useHoa } from "../context/HoaContext";
import { getAWSResource } from "../utils/awsHelper";
import DashboardNavbar from "../components/DashboardNavbar";
import ModalAlert from "../components/ModalAlert";
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
  const [deleteError, setDeleteError] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  const handleDelete = async () => {
    if (!canAccess || !userToDelete?._id || userToDelete.role === "owner" || deletingId) return;
    const userId = userToDelete._id;
    setDeletingId(userId);
    setDeleteError(null);
    try {
      await axios.delete(`/users/${userId}`);
      setUsers(currentUsers => currentUsers.filter(user => user._id !== userId));
      setUserToDelete(null);
    } catch (error) {
      setDeleteError(error.response?.data?.message || error.message || "Failed to delete user.");
      setUserToDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

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
          {deleteError && <p className="displayerror" role="alert">{deleteError}</p>}
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
                  {user.role !== "owner" && (
                    <button
                      type="button"
                      className="btnxs btn-danger full-row"
                      onClick={() => {
                        setDeleteError(null);
                        setUserToDelete(user);
                      }}
                      disabled={Boolean(deletingId)}
                    >
                      {deletingId === user._id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
        <ModalAlert
          isOpen={Boolean(userToDelete)}
          type="delete"
          title="Confirm Delete"
          message={`Delete ${[userToDelete?.first_name, userToDelete?.last_name].filter(Boolean).join(" ") || "this user"}? This cannot be undone.${users.length === 1 ? " Deleting the last user will also delete the unit." : ""}`}
          confirmText={deletingId ? "Deleting..." : "Delete"}
          onConfirm={handleDelete}
          onCancel={() => { if (!deletingId) setUserToDelete(null); }}
        />
      </div>
  );
  }
}
