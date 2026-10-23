import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ParkingSpacesOverview from "./ParkingSpacesOverview";


export default function HoaInformation({ hoa }) {
  const { hoaId } = useParams();
  const navigate = useNavigate();

  /*
   const handleDetailsClick = (vehicle) => {

    const vid = vehicle._id;
    const uid = vehicle.unitnumber;

    const qry = `/${hoaId}/vehicledetails/modify/${vid}`;
    navigate(qry, {
      state: {
        unitNumber: uid, role: "renter",
        vehicles: vehicles, ownerOfUnit: ownerOfUnit, vehid: vid
      }
    });
  }
  */

  const handleEmailClick = (email) => {
    const qry = `/${hoaId}/email-from-hoa`;
    // console.log('handleEmailClick called with hoa:', hoa.contact_information[2].email)

    navigate(qry, {
      state: { email: email, fromwhere: "hoainformation" }
    });

  };

  return (

    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      justifyContent: 'center',

    }}>
      <section className="standardsectiondashboard">
        <h3 style={{ color: "#1976d2", marginTop: 0, textAlign: "left", marginLeft: "15px" }}>Contact Information</h3>
        {hoa?.contact_information && hoa.contact_information.length > 0 && (
          <div className="hoainformation" style={{ textAlign: "left", marginTop: "15px", marginLeft: "15px" }}>
            {hoa.contact_information.map((contact, index) => (
              <div style={{ marginTop: "15px" }} key={index}>
                <strong>{contact.phone_description || "Contact"}:</strong><br />
                {contact.phone_number && <span>Phone: {contact.phone_number}<br /></span>}
                {/* {contact.email && <span>Email: {contact.email}</span>} */}
                {contact.email && (
                  <div>
                    {/* <div style={{marginTop:"2px",textAlign:"center"}}>Email:</div> */}
                    <div className="button-gridx" style={{ margin: "3px" }}>

                      <button className="btns_nm btn-secondary"
                        onClick={() => { handleEmailClick(contact.email) }}
                        style={{ width: "100%" }}>{contact.email}</button>
                    </div>
                  </div>)}
                {/* {contact.contact_id == 'hoa_primary' && (
                  <div className="button-grid" style={{margin:"5px 0"}}>
                    <button className="btns btn-secondary" onClick={() => { handleEmailClick(contact.email) }}>Email HOA</button>
                  </div>

                )} */}

              </div>
            ))}
          </div>
        )}

      </section>
      <section className="standardsectiondashboard">
        <h3 style={{ color: "#1976d2", marginTop: 0, textAlign: "center" }}>HOA Address</h3>
        {hoa && (
          <>
            <div className="hoainformation2col" style={{ textAlign: "left", marginTop: "15px", marginLeft: "15px" }}>
              <div><strong>Name:</strong></div><div> {hoa.name}</div>
              <div><strong>Address:</strong></div><div> {hoa.address}</div>
              <div><strong>City:</strong></div><div> {hoa.city}</div>
              <div><strong>State:</strong></div><div>{hoa.state}</div>
              <div><strong>Zip:</strong></div><div>{hoa.zip}</div>
              <div><strong>Id:</strong></div><div> {hoa.hoaid}</div>
            </div>



            <h3 style={{ color: "#1976d2", marginTop: "15px", marginBottom: "15px", textAlign: "center" }}>Parking Settings</h3>
            <div className="hoainformation2colr" style={{ textAlign: "left", marginTop: "15px", marginLeft: "15px" }}>
              <div><strong>Total Parking Places:</strong> </div><div>{hoa.parking_allowed_hoa}</div>
              <div><strong>Handicapped Places:</strong> </div><div>{hoa.parking_handicapped_hoa}</div>
              <div><strong>Handicapped Used:</strong> </div><div>{0}</div>
              <div><strong>Owner Daily Passes:</strong> </div><div>{hoa.daypasses_allowed_owner}</div>
              <div><strong>Tenant Daily Passes:</strong> </div><div>{hoa.daypasses_allowed_tenant}</div>
              <div><strong>Unit Parking Allowed</strong> </div><div>{hoa.parking_allowed_unit}</div>
              <div><strong>Renter Parking Allowed</strong> </div><div>{hoa.parking_allowed_renter}</div>

              <div><strong>Day Passes Allowed:</strong> </div><div>{8}</div>
              <div><strong>Day Passes Used:</strong> </div><div>{4}</div>
         
         



              {/* <div><strong>Owner Free Spots:</strong> {hoa.owner_free_parking_spots}</div>
            <div><strong>Renter Free Spots:</strong> {hoa.renter_free_parking_spots}</div> */}
            </div>
          </>
        )}
      </section>

      <section className="standardsectiondashboard" style={{display:"none"}}>
        <h3 style={{ color: "#1976d2", marginTop: 0, textAlign: "center" }}>Parking Spaces</h3>

        {/* {hoa && <ParkingSpacesOverview />} */}
        <div className="hoainformation2colr" style={{ textAlign: "left", marginTop: "15px", marginLeft: "15px" }}>
          <div><strong>Day Passes Allowed:</strong> </div><div>{8}</div>
          <div><strong>Day Passes Used:</strong> </div><div>{4}</div>
          <div><strong>Handicapped Places:</strong> </div><div>{7}</div>
          <div><strong>Handicapped Used:</strong> </div><div>{2}</div>
        </div>
      </section>
    </div>

  )
}
