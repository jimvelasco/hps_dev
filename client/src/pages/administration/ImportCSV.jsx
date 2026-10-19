import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../services/api";
import DashboardNavbar from "../../components/DashboardNavbar";
import { useHoa } from "../../context/HoaContext";
import { getAWSResource } from "../../utils/awsHelper";

export default function ImportCSV() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa } = useHoa();
  const [file, setFile] = useState(null);
  const [targetHoaId, setTargetHoaId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file || !targetHoaId.trim()) return;

    setSubmitting(true);
    setMessage("");

    try {
      const selectedHoaId = targetHoaId.trim();
      const data = new FormData();
      data.append("file", file);
      data.append("hoaid", selectedHoaId);
      const response = await axios.post(`/hoas/${encodeURIComponent(selectedHoaId)}/import-users-csv`, data);
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to submit CSV file.");
    } finally {
      setSubmitting(false);
    }
  };

   let backgroundImage = '';
    if (hoa) {
      backgroundImage = getAWSResource(hoa, 'BI');
    }

  return (
    <div  className="page-background" style={{ backgroundImage: `url('${backgroundImage}')` }}>
      <DashboardNavbar
        title="Import CSV"
        title2={hoa?.name}
        buttons={[{ label: "Back", onClick: () => navigate(`/${hoaId}/admin`), which: "goback" }]}
      />
      <div className="page-content">
        <div className="standardtitlebar_blackonwhite">
          <h1>Import CSV</h1>
        </div>
        <div className="grid-flex-container">
          <section className="standardsection-wide">
            <form className="import-csv-form" onSubmit={handleSubmit}>
              <label htmlFor="target-hoaid">HOA ID</label>
              <input
                id="target-hoaid"
                className="standardinput"
                type="text"
                value={targetHoaId}
                onChange={(event) => {
                  setTargetHoaId(event.target.value);
                  setMessage("");
                }}
                required
                disabled={submitting}
              />
              <label htmlFor="hoa-user-csv">Select CSV file</label>
              <input
                id="hoa-user-csv"
                className="standardinput"
                type="file"
                accept=".csv,text/csv"
                required
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                  setMessage("");
                }}
                disabled={submitting}
              />
              <button className="standardsubmitbutton180" type="submit" disabled={!file || !targetHoaId.trim() || submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </form>
            {message && <p role="status">{message}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
