import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHoa } from "../context/HoaContext";
import { useError } from "../context/ErrorContext";

export default function Renters() {
  const { hoaId } = useParams();
  const navigate = useNavigate();
  const { hoa, loading, error, fetchHoaById } = useHoa();
  const { setAppError } = useError();

  // useEffect(() => {
  //   if (hoaId) {
  //     console.log("renters.jsx Fetching HOA data for ID:", hoaId);
  //     fetchHoaById(hoaId).catch((err) => {
  //       setAppError(err.message || "Failed to load HOA data");
  //       navigate("/error");
  //     });
  //   }
  // }, [hoaId, fetchHoaById, setAppError, navigate]);

  // if (loading) {
  //   return <div style={{ padding: "20px" }}>Loading HOA data...</div>;
  // }

  // if (error) {
  //   setAppError(error);
  //   navigate("/error");
  //   return null;
  // }

  return (
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <h2>Renters Information</h2>
      
      {hoa && (
        <div>
          <section style={{ marginBottom: "30px" }}>
            <h3>{hoa.name}</h3>
            <p>
              {hoa.address}<br />
              {hoa.city}, {hoa.state} {hoa.zip}
            </p>
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h4>Parking Information</h4>
            <ul>
              <li>Allowed Parking Spots per Renter: {hoa.parking_allowed_renter}</li>
              <li>Free Parking Spots: {hoa.renter_free_parking_spots}</li>
              <li>Seasonal Adjustment: {hoa.season_adjust_renter}</li>
            </ul>
          </section>

          {hoa.contact_information && hoa.contact_information.length > 0 && (
            <section style={{ marginBottom: "30px" }}>
              <h4>Contact Information</h4>
              <ul>
                {hoa.contact_information.map((contact, index) => (
                  <li key={index}>
                    <strong>{contact.phone_description || "Contact"}:</strong>{" "}
                    {contact.phone_number && <span>{contact.phone_number} | </span>}
                    {contact.email && <span>{contact.email}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hoa.help_text?.renter && (
            <section style={{ marginBottom: "30px" }}>
              <h4>Renter Guidelines</h4>
              <p>{hoa.help_text.renter}</p>
            </section>
          )}

          {hoa.parking_information_url && (
            <section>
              <h4>More Information</h4>
              <a href={hoa.parking_information_url} target="_blank" rel="noopener noreferrer">
                View Parking Information
              </a>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
