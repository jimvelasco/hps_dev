import React from "react";

export default function HoaInformation({ hoa }) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      justifyContent: 'center'
    }}>
      <section className="standardsectiondashboard">
        <h3 style={{ color: "#1976d2", marginTop: 0 }}>HOA Information</h3>
        {hoa && (
          <div className="hoainformation">
            <div><strong>Name:</strong> {hoa.name}</div>
            <div><strong>Address:</strong> {hoa.address}</div>
            <div><strong>City:</strong> {hoa.city}</div>
            <div><strong>State:</strong> {hoa.state}</div>
            <div><strong>Zip:</strong> {hoa.zip}</div>
            <div><strong>Hoa Id:</strong> {hoa.hoaid}</div>
            <br />
            <h3 style={{ color: "#1976d2", marginTop: 0 }}>Parking Settings</h3>
            <div><strong>HOA Parking Allowed:</strong> {hoa.parking_allowed_hoa}</div>
            <div><strong>Owner Inventory Allowed:</strong> {hoa.inventory_allowed_owner}</div>
            <div><strong>Owner Parking Allowed:</strong> {hoa.parking_allowed_owner}</div>
            <div><strong>Renter Parking Allowed</strong> {hoa.parking_allowed_renter}</div>
            <div><strong>Owner Free Spots:</strong> {hoa.owner_free_parking_spots}</div>
            <div><strong>Renter Free Spots:</strong> {hoa.renter_free_parking_spots}</div>
          </div>
        )}
      </section>
      {hoa?.contact_information && hoa.contact_information.length > 0 && (
        <section className="standardsectiondashboard">
          <h3 style={{ color: "#1976d2", marginTop: 0 }}>Contact Information</h3>
          <div className="hoainformation">
            {hoa.contact_information.map((contact, index) => (
              <div key={index}>
                <strong>{contact.phone_description || "Contact"}:</strong><br />
                {contact.phone_number && <span>Phone: {contact.phone_number}<br /></span>}
                {contact.email && <span>Email: {contact.email}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
