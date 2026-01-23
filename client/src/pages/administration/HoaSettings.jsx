import React,{ useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../../services/api";
import { useHoa } from "../../context/HoaContext";
import DashboardNavbar from "../../components/DashboardNavbar";
import { getAWSResource } from "../../utils/awsHelper";

export default function HoaSettings() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hoa, loading: hoaLoading, fetchHoaById } = useHoa();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stripeStatus, setStripeStatus] = useState({ onboardingComplete: false });
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
      checkStripeStatus();
    }
  }, [hoaId, hoa, fetchHoaById]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("stripe_onboarding") === "success") {
      setSuccess("Stripe onboarding completed successfully!");
      checkStripeStatus();
    } else if (params.get("stripe_onboarding") === "refresh") {
      setError("Stripe onboarding was interrupted. Please try again.");
    }
  }, [location]);

  const checkStripeStatus = async () => {
    try {
      const response = await axios.get(`/hoas/${hoaId}/stripe-status`);
      setStripeStatus(response.data);
    } catch (err) {
      console.error("Error checking Stripe status:", err);
    }
  };

  const handleConnectStripe = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`/hoas/${hoaId}/stripe-connect`);
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      setError("Failed to initialize Stripe onboarding");
      console.error("Stripe connect error:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const oktoshowonboarding = true;

  return (
      <div className="page-background" style={{ backgroundImage: `url('${backgroundImage}')` }}>
      <DashboardNavbar title="HOA Settings" buttons={navButtons} />

      <div className="page-content">
        <div className="standardtitlebar">
          <h2>HOA Settings</h2>
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

          {oktoshowonboarding && (
         
          <section className="standardsection-wide" style={{ marginTop: "20px",justifyItems: "center", alignItems: "center", display: "flex", flexDirection: "column",maxWidth:"320px",margin:"0 auto" }}>
            <h3 style={{ color: "#1976d2", marginTop: 0 }}>Stripe Payouts</h3>
            <p style={{ fontSize: "14px", marginBottom: "15px" }}>
              To receive payments, you must connect your Stripe account. 
              HOA Parking Solutions takes a small fee from each transaction and deposits the rest directly into your account.
            </p>
            
            {stripeStatus.onboardingComplete ? (
              <div style={{ padding: "15px", backgroundColor: "#e8f5e9", borderRadius: "4px", border: "1px solid #c8e6c9", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#2e7d32", fontSize: "20px" }}>✅</span>
                <div>
                  <strong style={{ color: "#2e7d32" }}>Stripe Connected & Ready</strong>
                  <div style={{ fontSize: "12px", color: "#4caf50" }}>
                    Payments and transfers are active.
                  </div>
                </div>
              </div>
            ) : stripeStatus.details_submitted ? (
              <div style={{ padding: "15px", backgroundColor: "#fff3e0", borderRadius: "4px", border: "1px solid #ffe0b2" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <span style={{ color: "#ef6c00", fontSize: "20px" }}>⏳</span>
                  <strong style={{ color: "#ef6c00" }}>Pending Verification</strong>
                </div>
                <p style={{ fontSize: "13px", margin: "0 0 10px 0" }}>
                  Your details have been submitted, but Stripe is still verifying your account for transfers. 
                  This usually takes a few minutes but can take up to 24 hours.
                </p>
                <button
                  onClick={handleConnectStripe}
                  disabled={loading}
                  className="btn btn-default"
                  style={{ width: "auto", fontSize: "12px" }}
                >
                  {loading ? "Checking..." : "Check Status on Stripe"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectStripe}
                disabled={loading}
                className="btn btn-primary"
                style={{ width: "auto" }}
              >
                {loading ? "Connecting..." : "Connect Stripe Express"}
              </button>
            )}
          </section>
           )
            }

          <div className="button-grid" style={{ marginTop: "20px" }}>
           
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            <button
              onClick={handleBackClick}
              className="btn btn-default"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


