import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";
import TestComponent from "../components/TestComponent";
import ViolationsAccordion from "../components/ViolationsAccordion";
import { useHoa } from "../context/HoaContext";
import "../styles/global.css";

export default function TestPage() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    if (hoa) {
      setHtmlContent(hoa.help_text.renter_tc);
    }
  }, [hoa]);

  const handleBackClick = () => {
    navigate(`/${hoaId}/admin`);
  };

  const navButtons = [
    {
      label: "Back",
      onClick: handleBackClick,
      color: "#2196f3",
      hoverColor: "#1976d2",
    },
  ];

  // if (!hoa) {
  //   return <div style={{ padding: "20px" }}>Loading...</div>;
  // }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <DashboardNavbar title="Test Page" buttons={navButtons} />

      <div className="page-content">
        <button className="standardbutton" onClick={handleBackClick}>
          Test page button
        </button>

        <div className="standardcard">
          <h2>Parking Violations</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Review all registered parking violations below:
          </p>
          <ViolationsAccordion hoaId={hoaId} />
        </div>

        <div style={{ marginTop: "30px" }}>
          <div className="xstandardcard">
            <h3>General Parking Rules</h3>
            <ul style={{ lineHeight: "1.8", color: "#555" }}>
              <li>
                Owners must register their own vehicles and visitor's vehicles,
                if parked in our lots overnight, in Yampa Views's Parking App and
                set each vehicle's ONSITE indicator to YES or NO accordingly.
              </li>
              <li>
                Renters must register their vehicles (under the unit number
                they're renting from), if parked in our lots at any time, in the
                Parking App. It is the owner's responsibility to inform your
                renters that they must register their vehicles.
              </li>
              <li>
                Maximum 2 registered vehicles per unit in our parking lots at
                any time, unless temporary permission is granted by the Mgmt.
                Company.
              </li>
              <li>
                Park within marked parking spaces, using good judgment when snow
                is on the ground.
              </li>
              <li>
                Do not obstruct/block driveways, walkways, parking spaces, trash
                receptacles, shuttle bus turnaround, or snow storage area.
              </li>
              <li>No parking in driveway leading into upper parking lot.</li>
              <li>
                When new snow falls, move your vehicle daily to allow for snow
                plowing.
              </li>
              <li>
                No inoperative, immobile, stored, or expired tag vehicles.
              </li>
              <li>No vehicle major maintenance, including oil changes.</li>
              <li>
                No playing baseball, softball, or any other activity which may
                damage vehicles or property.
              </li>
              <li>
                Parking violations may be subject to immediate towing or
                booting, at owner expense.
              </li>
              <li>
                No trailers or oversized vehicles. NOTE: Owners see Rules and
                Regulations.
              </li>
            </ul>
          </div>
        </div>

        <TestComponent />
      </div>
    </div>
  );
}