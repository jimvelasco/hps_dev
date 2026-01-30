import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../services/api";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";
import DashboardNavbar from "../components/DashboardNavbar";
import { getAWSResource } from "../utils/awsHelper";

/*
 @media (width >= 800px) {
    .standard-table {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;
    }
  }

  @media (width < 800px) {
    .standard-table {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
  }
    */

const tableStyles = `
 
  .standard-table-header {
    background-color: #1976d2;
    color: white;
    font-weight: bold;
    padding: 12px;
    text-align: left;
    border-radius: 4px 4px 0 0;
  }

  .standard-table-header.sortable {
    cursor: pointer;
    user-select: none;
  }

  .standard-table-header.sortable:hover {
    background-color: #1565c0;
  }

  .standard-table-cell {
    padding: 12px;
    border-bottom: 1px solid #e0e0e0;
    font-size: 14px;
  }

  .standard-table-row:last-child .standard-table-cell {
    border-bottom: none;
  }
  .users-one {
    background-color: #1976d2;
    color: white;
    font-weight: bold;
    padding: 12px;
    text-align: left;
    border-radius: 4px 4px 0 0;
  }
  .users-two {
    background-color: #1976d2;
    color: white;
    font-weight: bold;
    padding: 12px;
    text-align: left;
    border-radius: 4px 4px 0 0;
  }
`;

export default function Users() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const { setAppError } = useError();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [sortColumn, setSortColumn] = useState("last_name");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const response = await axios.get("/users", {
          params: { hoaId }
        });
        setUsers(response.data);
      } catch (err) {
        setUsersError(err.message || "Failed to fetch users");
        console.error("Error fetching users:", err);
      } finally {
        setUsersLoading(false);
      }
    };

    if (hoaId) {
      fetchUsers();
    }
  }, [hoaId]);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading HOA data...</div>;
  }

  if (error) {
    setAppError(error);
    navigate(`/${hoaId}/error`);
    return null;
  }

  const handleBackToDashboard = () => {
    navigate(`/${hoaId}/dashboard`);
  };

  const handleCreateUserClick = () => {
    navigate(`/${hoaId}/user`);
  };

  const handleEditUserClick = (userId) => {
    navigate(`/${hoaId}/user/${userId}`);
  };

  const handleSort = (column) => {
    let newDirection = "asc";
    if (sortColumn === column && sortDirection === "asc") {
      newDirection = "desc";
    }

    setSortColumn(column);
    setSortDirection(newDirection);

    const sorted = [...users].sort((a, b) => {
      let valueA, valueB;

      if (column === "last_name") {
        valueA = (a.last_name || "").toLowerCase();
        valueB = (b.last_name || "").toLowerCase();
      } else if (column === "unitnumber") {
        valueA = (a.unitnumber || "").toLowerCase();
        valueB = (b.unitnumber || "").toLowerCase();
      }

      if (newDirection === "asc") {
        return String(valueA).localeCompare(String(valueB));
      } else {
        return String(valueB).localeCompare(String(valueA));
      }
    });

    setUsers(sorted);
  };

  const navButtons = [
    {
      label: "Back",
      onClick: handleBackToDashboard,
      which: "goback"
    }
  ];

  let backgroundImage = '';
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
  }
  
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", backgroundImage: `url('${backgroundImage}')`,
     backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <DashboardNavbar title="Users" buttons={navButtons} />

      <div className="page-content">

        <div className="flexLayout" style={{justifyContent: "flex-end"}}>
          {/* {hoa && (
            <React.Fragment>

              <div>HOA Parking Allowed: {hoa.parking_allowed_hoa}</div>
              <div>Owner Free Spots: {hoa.owner_free_parking_spots}</div>
              <div>Renter Free Spots: {hoa.renter_free_parking_spots}</div>
            </React.Fragment >
          )} */}

          <button className="standardsubmitbutton"
            onClick={handleCreateUserClick}
          >
            New User
          </button>
        </div>

        <div style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>
          {/* <style>
            {`
               ${tableStyles}
              @media (width >= 800px) {
                .standard-table-extra {
                  display: block !important;
                }
                .users-one {
                  display: block !important;
                }
                .users-two {
                  display: none !important;
                }
              }
              @media (width < 800px) {
                .standard-table-extra {
                  display: none !important;
                }
                .users-one {
                  display: none !important;
                }
                .users-two {
                  display: block !important;
                }
              }
            `}
          </style> */}







          <h3 style={{ color: "#333", marginTop: 0 }}>User List</h3>

          {usersLoading ? (
            <p style={{ color: "#666" }}>Loading users...</p>
          ) : usersError ? (
            <p style={{ color: "#d32f2f" }}>Error: {usersError}</p>
          ) : users.length === 0 ? (
            <p style={{ color: "#666" }}>No users found for this HOA.</p>
          ) : (
            <div className="users-table" style={{ marginTop: "20px" }}>
              <div className="standard-table-header">First Name</div>
              <div
                className="standard-table-header sortable"
                onClick={() => handleSort("last_name")}
              >
                Last Name {sortColumn === "last_name" && (sortDirection === "asc" ? "▲" : "▼")}
              </div>
              <div className="standard-table-header">Email</div>
              <div className="standard-table-header">Phone</div>
              <div
                className="standard-table-header standard-table-extra sortable"
                onClick={() => handleSort("unitnumber")}
              >
                Unit {sortColumn === "unitnumber" && (sortDirection === "asc" ? "▲" : "▼")}
              </div>
              <div className="standard-table-header standard-table-extra">Role</div>
               <div className="standard-table-header standard-table-extra">O Free</div>
                <div className="standard-table-header standard-table-extra">R Free</div>


              {users.map((user, index) => (
                <React.Fragment key={user._id || index}>
                  <div className="standard-table-cell">{user.first_name || "—"}</div>
                  <div
                    className="standard-table-cell"
                    onClick={() => handleEditUserClick(user._id)}
                    style={{
                      cursor: "pointer",
                      color: "#1976d2",
                      textDecoration: "underline",
                      fontWeight: "500"
                    }}
                    onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                    onMouseLeave={(e) => e.target.style.textDecoration = "underline"}
                  >
                    {user.last_name || "—"}
                  </div>
                  <div className="standard-table-cell">{user.email || "—"}</div>
                  <div className="standard-table-cell">{user.phone || "—"}</div>
                  <div className="standard-table-cell standard-table-extra">{user.unitnumber || "—"}
                    
                  </div>
                  <div className="standard-table-cell standard-table-extra">
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor: user.role === "admin" ? "#d32f2f" : user.role === "owner" ? "#1976d2" : "#4caf50",
                      color: "white",
                      fontSize: "12px"
                    }}>
                      {user.role || "—"}
                    </span>
                  </div>
                  <div className="standard-table-cell">{user.owner_free_parking}</div>
                   <div className="standard-table-cell">{user.renter_free_parking}</div>

                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="users-one">what</div>
      <div className="users-two">where</div>
    </div>
  );
}
