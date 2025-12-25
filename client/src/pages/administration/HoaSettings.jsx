import React,{ useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/api";
import { useHoa } from "../../context/HoaContext";
import DashboardNavbar from "../../components/DashboardNavbar";

export default function HoaSettings() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading: hoaLoading, fetchHoaById } = useHoa();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    hoaid: "",
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    parking_allowed_hoa: 50,
    inventory_allowed_owner: 5,
    parking_allowed_renter: 2,
    parking_allowed_owner: 2,
    renter_free_parking_spots: 1,
    owner_free_parking_spots: 5,
    background_image_url: "",
    parking_information_url: ""
  });

  useEffect(() => {
    if (!hoa) {
      fetchHoaById(hoaId);
    } else {
      setFormData({
        hoaid: hoa.hoaid || "",
        name: hoa.name || "",
        address: hoa.address || "",
        city: hoa.city || "",
        state: hoa.state || "",
        zip: hoa.zip || "",
        parking_allowed_hoa: hoa.parking_allowed_hoa || 50,
        inventory_allowed_owner: hoa.inventory_allowed_owner || 5,
        parking_allowed_renter: hoa.parking_allowed_renter || 2,
        parking_allowed_owner: hoa.parking_allowed_owner || 2,
        renter_free_parking_spots: hoa.renter_free_parking_spots || 1,
        owner_free_parking_spots: hoa.owner_free_parking_spots || 5,
        background_image_url: hoa.background_image_url || "",
        parking_information_url: hoa.parking_information_url || ""
      });
    }
  }, [hoaId, hoa, fetchHoaById]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numericFields = [
      "parking_allowed_hoa",
      "inventory_allowed_owner",
      "parking_allowed_renter",
      "parking_allowed_owner",
      "renter_free_parking_spots",
      "owner_free_parking_spots"
    ];

    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseInt(value) || 0 : value
    }));
    setSuccess(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.put(`/hoas/${hoaId}`, formData);
      if (response.status === 200) {
        setSuccess("HOA settings saved successfully");
        fetchHoaById(hoaId);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save HOA settings");
      console.error("Error saving HOA settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleBackClick = () => {
    navigate(`/${hoaId}/admin`);
  };

  const navButtons = [
    {
      label: "Back to Administration",
      onClick: handleBackClick,
      which: "goback"
    }
  ];

  if (hoaLoading) {
    return <div>Loading...</div>;
  }
   let backgroundImage = '';
  if (hoa) {
    backgroundImage = hoa.background_image_url;
  }

  return (
      <div className="page-background" style={{ backgroundImage: `url('${backgroundImage}')` }}>
      <DashboardNavbar title="HOA Settings" buttons={navButtons} />

      <div className="page-content">
        <div className="standardtitlebar">
          <h1>HOA Settings</h1>
        </div>

        {error && (
          <div className="editable-table-error">
            {error}
          </div>
        )}

        {success && (
          <div className="editable-table-success">
            {success}
          </div>
        )}

        <div className="hoa-settings-container">
          <div className="hoa-settings-form">
            <div>
              <label className="input-label">HOA ID</label>
              <input
                type="text"
                className="standardinput"
                value={formData.hoaid}
                disabled
              />
            </div>

            <div>
              <label className="input-label">Name</label>
              <input
                type="text"
                className="standardinput"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="hoa-settings-full-width">
              <label className="input-label">Address</label>
              <input
                type="text"
                className="standardinput"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="input-label">City</label>
              <input
                type="text"
                className="standardinput"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="input-label">State</label>
              <input
                type="text"
                className="standardinput"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="input-label">Zip</label>
              <input
                type="text"
                className="standardinput"
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="input-label">Parking Allowed (HOA)</label>
              <input
                type="number"
                className="standardinput"
                name="parking_allowed_hoa"
                value={formData.parking_allowed_hoa}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="input-label">Inventory Allowed (Owner)</label>
              <input
                type="number"
                className="standardinput"
                name="inventory_allowed_owner"
                value={formData.inventory_allowed_owner}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="input-label">Parking Allowed (Renter)</label>
              <input
                type="number"
                className="standardinput"
                name="parking_allowed_renter"
                value={formData.parking_allowed_renter}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="input-label">Parking Allowed (Owner)</label>
              <input
                type="number"
                className="standardinput"
                name="parking_allowed_owner"
                value={formData.parking_allowed_owner}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="input-label">Renter Free Parking Spots</label>
              <input
                type="number"
                className="standardinput"
                name="renter_free_parking_spots"
                value={formData.renter_free_parking_spots}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="input-label">Owner Free Parking Spots</label>
              <input
                type="number"
                className="standardinput"
                name="owner_free_parking_spots"
                value={formData.owner_free_parking_spots}
                onChange={handleInputChange}
              />
            </div>

            <div className="hoa-settings-full-width">
              <label className="input-label">Background Image URL</label>
              <input
                type="text"
                className="standardinput"
                name="background_image_url"
                value={formData.background_image_url}
                onChange={handleInputChange}
              />
            </div>

            <div className="hoa-settings-full-width">
              <label className="input-label">Parking Information URL</label>
              <input
                type="text"
                className="standardinput"
                name="parking_information_url"
                value={formData.parking_information_url}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="hoa-settings-buttons">
            <button
              onClick={handleSave}
              disabled={saving}
              className="standardsubmitbutton"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            <button
              onClick={handleBackClick}
              className="standardcancelbutton"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
