import React from "react";
import { useParams, useNavigate } from "react-router-dom";

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
      state: { email:email }
    });

  };

  // const handleEmailClick = () => {
  //    const qry =`/${hoaId}/email-from-hoa`;
  //   navigate(`/${hoaId}/email-from-hoa`);
  // };
  return (
    <>
    {/* <div className="standardtitlebar2" style={{width:"300px",opacity: "1.0"}}>
          <span style={{color:"#1976d2"}}><b>Home Owners Assocation</b></span>
          
        </div> */}
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      justifyContent: 'center',

    }}>
      <section className="standardsectiondashboard">
        <h3 style={{ color: "#1976d2", marginTop: 0 ,textAlign:"center"}}>Contact Information</h3>
        {hoa?.contact_information && hoa.contact_information.length > 0 && (
          <div className="hoainformation"  style={{ textAlign:"center",marginTop:"15px"}}>
            {hoa.contact_information.map((contact, index) => (
              <div style={{marginTop:"15px"}}>
                <strong>{contact.phone_description || "Contact"}:</strong><br />
                {contact.phone_number && <span>Phone: {contact.phone_number}<br /></span>}
                {/* {contact.email && <span>Email: {contact.email}</span>} */}
                 {contact.email && (
                  <div>
                   {/* <div style={{marginTop:"2px",textAlign:"center"}}>Email:</div> */}
                  <div className="button-gridx" style={{margin:"3px"}}>
                   
                  <button className="btns_nm btn-primary2" onClick={() => { handleEmailClick(contact.email) }}>{contact.email}</button>
                  </div>
                  </div>)}
                {/* {contact.contact_id == 'hoa_primary' && (
                  <div className="button-grid" style={{margin:"5px 0"}}>
                    <button className="btns btn-primary2" onClick={() => { handleEmailClick(contact.email) }}>Email HOA</button>
                  </div>

                )} */}

              </div>
            ))}
          </div>
        )}

      </section>
      <section className="standardsectiondashboard">
        <h3 style={{ color: "#1976d2", marginTop: 0 ,textAlign:"center" }}>HOA Address</h3>
        {hoa && (
          <div className="hoainformation"  style={{ textAlign:"center",marginTop:"15px"}}>
            <div><strong>Name:</strong> {hoa.name}</div>
            <div><strong>Address:</strong> {hoa.address}</div>
            <div><strong>City:</strong> {hoa.city}</div>
            <div><strong>State:</strong> {hoa.state}</div>
            <div><strong>Zip:</strong> {hoa.zip}</div>
            <div><strong>Id:</strong> {hoa.hoaid}</div>
            {/* <br />
            <h3 style={{ color: "#1976d2", marginTop: 0 }}>Parking Settings</h3>
            <div><strong>HOA Parking Allowed:</strong> {hoa.parking_allowed_hoa}</div>
            <div><strong>Owner Inventory Allowed:</strong> {hoa.inventory_allowed_owner}</div>
            <div><strong>Owner Parking Allowed:</strong> {hoa.parking_allowed_owner}</div>
            <div><strong>Renter Parking Allowed</strong> {hoa.parking_allowed_renter}</div>
            <div><strong>Owner Free Spots:</strong> {hoa.owner_free_parking_spots}</div>
            <div><strong>Renter Free Spots:</strong> {hoa.renter_free_parking_spots}</div> */}
          </div>
        )}
      </section>
    </div>
        </>

  );
}
