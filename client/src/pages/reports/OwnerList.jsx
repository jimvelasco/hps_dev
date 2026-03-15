import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/api";
import { useHoa } from "../../context/HoaContext";
import { useError } from "../../context/ErrorContext";
import DashboardNavbar from "../../components/DashboardNavbar";
import { getAWSResource } from "../../utils/awsHelper";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

export default function OwnerList() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error } = useHoa();
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
        // Filter for owners only, or show all based on "Owner List" name
        // The requirement says "Owner List that will be based on the User model"
        // Most likely it wants all users with role 'owner'
        const owners = response.data.filter(u => u.role === 'owner');
        
        // Default sort by last_name
        const sorted = [...owners].sort((a, b) => {
          const valA = (a.last_name || "").toLowerCase();
          const valB = (b.last_name || "").toLowerCase();
          return valA.localeCompare(valB);
        });
        
        setUsers(sorted);
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

  const handleBackToReports = () => {
    navigate(`/${hoaId}/reports`);
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
        valueA = a.last_name || "";
        valueB = b.last_name || "";
      } else if (column === "unitnumber") {
        valueA = a.unitnumber || "";
        valueB = b.unitnumber || "";
      }

      if (newDirection === "asc") {
        return String(valueA).localeCompare(String(valueB), undefined, { numeric: true, sensitivity: 'base' });
      } else {
        return String(valueB).localeCompare(String(valueA), undefined, { numeric: true, sensitivity: 'base' });
      }
    });

    setUsers(sorted);
  };

  const navButtons = [
    {
      label: "Back",
      onClick: handleBackToReports,
      which: "goback"
    }
  ];

  let backgroundImage = '';
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
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
      <DashboardNavbar title="Owner List" buttons={navButtons} />

      <div className="page-content">
        <div style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          opacity: 0.95
        }}>
          <h3 style={{ color: "#333", marginTop: 0, marginBottom: "20px" }}>Owner Contact Information</h3>

          {usersLoading ? (
            <p style={{ color: "#666" }}>Loading owners...</p>
          ) : usersError ? (
            <p style={{ color: "#d32f2f" }}>Error: {usersError}</p>
          ) : users.length === 0 ? (
            <p style={{ color: "#666" }}>No owners found for this HOA.</p>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr 0.8fr 1.5fr 1fr", 
              gap: 0,
              marginTop: "20px"
            }}>
              <div className="standard-table-header">First Name</div>
              <div
                className="standard-table-header"
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                onClick={() => handleSort("last_name")}
              >
                Last Name
                {sortColumn === "last_name" && (
                  <FontAwesomeIcon
                    icon={faArrowUp}
                    style={{ transform: sortDirection === "desc" ? "rotate(180deg)" : "none", fontSize: "12px" }}
                  />
                )}
              </div>
              <div
                className="standard-table-header"
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                onClick={() => handleSort("unitnumber")}
              >
                Unit Number
                {sortColumn === "unitnumber" && (
                  <FontAwesomeIcon
                    icon={faArrowUp}
                    style={{ transform: sortDirection === "desc" ? "rotate(180deg)" : "none", fontSize: "12px" }}
                  />
                )}
              </div>
              <div className="standard-table-header">Email</div>
              <div className="standard-table-header">Phone</div>

              {users.map((user, index) => (
                <React.Fragment key={user._id || index}>
                  <div className="standard-table-cell">{user.first_name || "—"}</div>
                  <div className="standard-table-cell" style={{ fontWeight: "500" }}>
                    {user.last_name || "—"}
                  </div>
                  <div className="standard-table-cell">{user.unitnumber || "—"}</div>
                  <div className="standard-table-cell">{user.email || "—"}</div>
                  <div className="standard-table-cell">{user.phone || "—"}</div>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
