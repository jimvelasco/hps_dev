import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/api";
import DashboardNavbar from "../../components/DashboardNavbar";
import ModalAlert from "../../components/ModalAlert";
import { useHoa } from "../../context/HoaContext";
import { getAWSResource } from "../../utils/awsHelper";

export default function UpdateAllUsers() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa } = useHoa();

  const [formData, setFormData] = useState({
    owner_free_parking: "",
    renter_free_parking: "",
    inventory_allowed_owner: "",
    parking_allowed_renter: "",
    parking_allowed_owner: ""
  });

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null });

  const handleBackClick = () => {
    navigate(`/${hoaId}/admin`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.owner_free_parking && !formData.renter_free_parking &&
      !formData.inventory_allowed_owner && !formData.parking_allowed_renter &&
      !formData.parking_allowed_owner) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "No Changes",
        message: "Please enter at least one value to update.",
        onConfirm: () => setModal({ ...modal, isOpen: false })
      });
      return;
    }

    setModal({
      isOpen: true,
      type: "confirm",
      title: "Confirm Update",
      message: "Are you sure you want to update these values for ALL users in this HOA? Values left blank will not be modified.",
      confirmText: "Update All",
      cancelText: "Cancel",
      onConfirm: processUpdate,
      onCancel: () => setModal({ ...modal, isOpen: false })
    });
  };

  const processUpdate = async () => {
    setLoading(true);
    try {
      const response = await axios.put("/users/batch/update-parking", {
        hoaid: hoaId,
        owner_free_parking: formData.owner_free_parking,
        renter_free_parking: formData.renter_free_parking,
        inventory_allowed_owner: formData.inventory_allowed_owner,
        parking_allowed_renter: formData.parking_allowed_renter,
        parking_allowed_owner: formData.parking_allowed_owner
      });

      setModal({
        isOpen: true,
        type: "success",
        title: "Update Successful",
        message: response.data.message,
        onConfirm: () => {
          setModal({ ...modal, isOpen: false });
          navigate(`/${hoaId}/admin`);
        }
      });
    } catch (error) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Update Error",
        message: error.response?.data?.message || "Error updating users",
        onConfirm: () => setModal({ ...modal, isOpen: false })
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      backgroundImage: `url('${backgroundImage}')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      <DashboardNavbar title="Update Users Parking" buttons={navButtons} />

      <div className="page-content">
        <div className="standardtitlebar">
          <h1 style={{ fontSize: "24px" }}>Batch Update User Parking</h1>
        </div>

        <div className="grid-flex-container">
          <section className="standardsection" style={{ maxWidth: "500px", margin: "0 auto" }}>
            <h3 style={{ color: "#e91e63", marginTop: 0 }}>Update Parking Defaults</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Enter the new free parking values for all users. Leave a field blank if you don't want to update it.
            </p>

            <form onSubmit={handleSubmit}>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Inventory Allowed Owner</label>
                <input
                  className="standardinput"
                  type="number"
                  name="inventory_allowed_owner"
                  value={formData.inventory_allowed_owner}
                  onChange={handleInputChange}
                  placeholder="Leave blank to skip"
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Parking Allowed Owner</label>
                <input
                  className="standardinput"
                  type="number"
                  name="parking_allowed_owner"
                  value={formData.parking_allowed_owner}
                  onChange={handleInputChange}
                  placeholder="Leave blank to skip"
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Owner Free Parking</label>
                <input
                  className="standardinput"
                  type="number"
                  name="owner_free_parking"
                  value={formData.owner_free_parking}
                  onChange={handleInputChange}
                  placeholder="Leave blank to skip"
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Parking Allowed Renter</label>
                <input
                  className="standardinput"
                  type="number"
                  name="parking_allowed_renter"
                  value={formData.parking_allowed_renter}
                  onChange={handleInputChange}
                  placeholder="Leave blank to skip"
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Renter Free Parking</label>
                <input
                  className="standardinput"
                  type="number"
                  name="renter_free_parking"
                  value={formData.renter_free_parking}
                  onChange={handleInputChange}
                  placeholder="Leave blank to skip"
                />
              </div>







              <div className="button-grid">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                >
                  {loading ? "Updating..." : "Update All Users"}
                </button>
              </div>
            </form>
          </section>
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
    </div>
  );
}
