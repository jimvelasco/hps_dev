import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../../services/api";
import { useHoa } from "../../context/HoaContext";
import DashboardNavbar from "../../components/DashboardNavbar";
import ModalAlert from "../../components/ModalAlert";
import { getAWSResource } from "../../utils/awsHelper";

export default function HoaSettings() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hoa, loading: hoaLoading, fetchHoaById } = useHoa();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    hoaid: "",
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    parking_allowed_hoa: 50,
    parking_handicapped_hoa: 0,
    inventory_allowed_owner: 5,
    parking_allowed_renter: 2,
    parking_allowed_owner: 2,
    renter_free_parking_spots: 2,
    owner_free_parking_spots: 5,
    parking_information_url: "",
    daypasses_allowed_owner: 1,
    parking_allowed_tenant: 2,
    tenant_free_parking_spots: 2,
    daypasses_allowed_tenant: 0,
    daypasses_allowed_renter: 0
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
        parking_handicapped_hoa: hoa.parking_handicapped_hoa || 0,
        inventory_allowed_owner: hoa.inventory_allowed_owner || 5,
        parking_allowed_renter: hoa.parking_allowed_renter || 2,
        parking_allowed_owner: hoa.parking_allowed_owner || 2,
        renter_free_parking_spots: hoa.renter_free_parking_spots || 1,
        owner_free_parking_spots: hoa.owner_free_parking_spots || 5,
        parking_information_url: hoa.parking_information_url || "",


        daypasses_allowed_owner: hoa.daypasses_allowed_owner || 1,
        parking_allowed_tenant: hoa.parking_allowed_tenant || 2,
        tenant_free_parking_spots: hoa.tenant_free_parking_spots || 2,
        daypasses_allowed_tenant: hoa.daypasses_allowed_tenant || 0,
        daypasses_allowed_renter: hoa.daypasses_allowed_renter || 0
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
      "owner_free_parking_spots",

      "daypasses_allowed_owner",
      "parking_allowed_tenant",
      "tenant_free_parking_spots",
      "daypasses_allowed_tenant",
      "daypasses_allowed_renter"
    ];

    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseInt(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await axios.put(`/hoas/${hoaId}`, formData);
      if (response.status === 200) {
        setIsSuccessModalOpen(true);
        fetchHoaById(hoaId);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save HOA settings");
    //  console.error("Error saving HOA settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleBackClick = () => {
    navigate(`/${hoaId}/admin`);
  };

  const navButtons = [
    {
      label: "Back",
      onClick: handleBackClick,
      which: "goback"
    }
  ];

  if (hoaLoading) {
    return <div>Loading...</div>;
  }

  let backgroundImage = '';
  if (hoa) {
    backgroundImage = getAWSResource(hoa, 'BI');
  }

  return (
    <div className="page-background" style={{ backgroundImage: `url('${backgroundImage}')` }}>
      <DashboardNavbar title="HOA Settings" title2={hoa && hoa.name} buttons={navButtons} />

      <div className="page-content">
        <div className="standardtitlebar_blackonwhite">
          <h2>HOA Settings</h2>
        </div>

        {error && (
          <div className="editable-table-error">
            {error}
          </div>
        )}

        <div className="hoa-settings-container" >
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
              <label className="input-label">Parking Spaces Available (No Handicap)</label>
              <input
                type="number"
                className="standardinput"
                name="parking_allowed_hoa"
                value={formData.parking_allowed_hoa}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="input-label">Parking Spaces Available (Handicap) </label>
              <input
                type="number"
                className="standardinput"
                name="parking_handicapped_hoa"
                value={formData.parking_handicapped_hoa}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label className="input-label">Inventory Allowed (Unit)</label>
              <input
                type="number"
                className="standardinput"
                name="inventory_allowed_owner"
                value={formData.inventory_allowed_owner}
                onChange={handleInputChange}
              />
            </div>

            <fieldset className="input-group">
              <legend><b>Owner</b></legend>

              <div  style={{ marginBottom: "15px" }}>
                <label className="input-label" style={{  marginBottom: "5px", fontWeight: "normal" }}>Parking Spaces Allowed</label>
                <input
                  type="number"
                  className="standardinput"
                  name="parking_allowed_owner"
                  value={formData.parking_allowed_owner}
                  onChange={handleInputChange}
                />
              </div>



              <div  style={{ marginBottom: "15px" }}>
                <label className="input-label" style={{  marginBottom: "5px", fontWeight: "normal" }}>Free Parking Spaces (No Charge)</label>
                <input
                  type="number"
                  className="standardinput"
                  name="owner_free_parking_spots"
                  value={formData.owner_free_parking_spots}
                  onChange={handleInputChange}
                />
              </div>
              <div  style={{ marginBottom: "15px" }}>
                <label className="input-label" style={{  marginBottom: "5px", fontWeight: "normal" }}>Day Passes Allowed</label>
                <input
                  type="number"
                  className="standardinput"
                  name="daypasses_allowed_owner"
                  value={formData.daypasses_allowed_owner}
                  onChange={handleInputChange}
                />
              </div>
            </fieldset>



            <fieldset className="input-group">
              <legend><b>Tenant (Long Term Renter)</b></legend>

              <div style={{ marginBottom: "15px" }}>
                <label className="input-label" style={{  marginBottom: "5px", fontWeight: "normal" }}>Parking Spaces Allowed</label>
                <input
                  type="number"
                  className="standardinput"
                  name="parking_allowed_tenant"
                  value={formData.parking_allowed_tenant}
                  onChange={handleInputChange}
                />
              </div>

              <div  style={{ marginBottom: "15px" }}>
                <label className="input-label" style={{  marginBottom: "5px", fontWeight: "normal" }}>Free Parking Spaces (No Charge)</label>
                <input
                  type="number"
                  className="standardinput"
                  name="tenant_free_parking_spots"
                  value={formData.tenant_free_parking_spots}
                  onChange={handleInputChange}
                />
              </div>
              <div  style={{ marginBottom: "15px" }}>
                <label className="input-label" style={{  marginBottom: "5px", fontWeight: "normal" }}>Day Passes Allowed</label>
                <input
                  type="number"
                  className="standardinput"
                  name="daypasses_allowed_tenant"
                  value={formData.daypasses_allowed_tenant}
                  onChange={handleInputChange}
                />
              </div>
            </fieldset>




            <fieldset className="input-group">
              <legend><b>Short Term Renter</b></legend>
              <div  style={{ marginBottom: "15px" }}>
                <label className="input-label" style={{  marginBottom: "5px", fontWeight: "normal" }}>Parking Spaces Allowed</label>
                <input
                  type="number"
                  className="standardinput"
                  name="parking_allowed_renter"
                  value={formData.parking_allowed_renter}
                  onChange={handleInputChange}
                />
              </div>

              <div  style={{ marginBottom: "15px" }}>
                <label className="input-label">Free Parking Spaces (No charge)</label>
                <input
                  type="number"
                  className="standardinput"
                  name="renter_free_parking_spots"
                  value={formData.renter_free_parking_spots}
                  onChange={handleInputChange}
                />
              </div>
              <div  style={{ marginBottom: "15px" }}>
                <label className="input-label" style={{  marginBottom: "5px", fontWeight: "normal" }}>Day Passes Allowed</label>
                <input
                  type="number"
                  className="standardinput"
                  name="daypasses_allowed_renter"
                  value={formData.daypasses_allowed_renter}
                   onChange={handleInputChange}
                />
              </div>
            </fieldset>



            {/* <div className="hoa-settings-full-width">
              <label className="input-label">Background Image URL</label>
              <input
                type="text"
                className="standardinput"
                name="background_image_url"
                value={formData.background_image_url}
                onChange={handleInputChange}
              />
            </div> */}

            <div className="hoa-settings-full-width">
              <label className="input-label" style={{  marginBottom: "5px", fontWeight: "normal" }}>Parking Information URL</label>
              <input
                type="text"
                className="standardinput"
                name="parking_information_url"
                value={formData.parking_information_url}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="button-grid" style={{ marginTop: "20px" }}>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? "Updating..." : "Update HOA"}
            </button>
            <button
              onClick={handleBackClick}
              className="btn btn-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      <ModalAlert
        isOpen={isSuccessModalOpen}
        type="alert"
        title="Success"
        message="HOA Update Successfull"
        confirmText="OK"
        onConfirm={() => {
          setIsSuccessModalOpen(false);
          navigate(`/${hoaId}/admin`);
        }}
      />
    </div>
  );
}


