import React from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();
  const { hoaId } = useParams();

  return (
    <div style={{
      backgroundImage: "url('http://hoaparking.s3.amazonaws.com/steamboat-ski-resort.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      minHeight: "100vh",
      padding: "20px"
    }}>
        <div className="standardtitlebar">
          <h2 onClick={() => navigate(hoaId ? `/${hoaId}` : "/")}>HOA Parking Solutions</h2>
        </div>

      <div style={{
        maxWidth: "900px",
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
        lineHeight: "1.6",
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "30px",
        opacity: "0.95"
      }}>
        <h1>About Our HOA Parking System</h1>

        <p>
          This website provides a simple, web-based parking management solution for Homeowners Associations (HOAs),
          especially those in high-demand areas such as ski resorts and vacation communities. It allows HOAs to
          efficiently manage limited parking while also creating fair and flexible policies for both property owners
          and renters.
        </p>

        <h2>Why This System Exists</h2>
        <p>
          Many HOAs face challenges with overcrowded parking lots, particularly during peak travel seasons. At the
          same time, some HOAs have unused parking capacity that could generate revenue. This platform gives each HOA
          the ability to balance demand, improve parking availability, and optionally create an additional income
          stream for the association.
        </p>

        <h2>How It Works</h2>
        <ul>
          <li>No app download is required — the system works directly in your web browser on any device.</li>
          <li>Users register vehicles using only a phone number and vehicle details. No email address is needed.</li>
          <li>Owners maintain a list of their vehicles and simply mark when they are leaving their unit.</li>
          <li>HOAs can configure free and paid parking rules for owners and renters.</li>
          <li>Administrators can easily control rates, date ranges, and contact information for their community.</li>
        </ul>

        <h2>Key Features</h2>
        <ul>
          <li>Web-based — works on iPhone, Android, tablet, or desktop</li>
          <li>Supports both disincentive-based and revenue-based parking strategies</li>
          <li>Highly configurable for owner and renter parking policies</li>
          <li>Stores official HOA parking rules and vehicle images securely in AWS as PDFs</li>
          <li>Provides an administrator dashboard for managing costs, availability, and communication</li>
        </ul>

        <h2>Designed for Simplicity</h2>
        <p>
          The system is intentionally easy to use. Owners and renters can register and manage vehicles in just a few
          minutes. By keeping the interface straightforward and requiring only essential information, the platform
          removes unnecessary barriers while still enforcing community parking policies.
        </p>

        <h2>Benefits for HOAs</h2>
        <ul>
          <li>Encourages responsible and limited parking usage</li>
          <li>Helps reduce parking congestion during peak periods</li>
          <li>Provides a flexible way to generate parking revenue when appropriate</li>
          <li>Eliminates the need for manual tracking or paper permits</li>
        </ul>

        <p>
          This platform is built to support your HOA's specific parking needs — whether your goal is to control
          crowding, improve convenience for owners, or create additional income for the association.
        </p>




{/* 
<div style={{marginTop:"70px", textAlign:"center"}}>
  Version 2
</div>
  <h1>About This HOA Parking App</h1>

  <p>
    This website makes parking at HOAs easier — especially in busy places like ski resorts and vacation communities.
    It helps HOAs manage parking fairly for owners and renters, and can even help associations earn money when
    parking demand is high.
  </p>

  <h2>What’s the Idea?</h2>
  <p>
    Some HOAs are always short on parking. Others have extra spaces that just sit unused.
    This app gives HOAs the tools to handle both situations. You can discourage overcrowding
    when things get tight, or turn extra spots into a revenue source when you have room.
  </p>

  <h2>How It Works</h2>
  <ul>
    <li>No download needed — just use it in your web browser on your phone, tablet, or computer.</li>
    <li>Register your car using only your phone number and vehicle details. No email required.</li>
    <li>Owners can keep a list of their vehicles and simply mark when they’re leaving.</li>
    <li>HOAs can set rules like “owners park free” or “renters pay for extra vehicles.”</li>
    <li>Administrators can easily manage dates, pricing, and HOA contact information.</li>
  </ul>

  <h2>Why People Like It</h2>
  <ul>
    <li>It’s simple and quick to use</li>
    <li>Works from any device</li>
    <li>Flexible for different HOA rules</li>
    <li>Secure — all documents and images are stored safely on AWS</li>
    <li>Helps keep parking fair and organized</li>
  </ul>

  <h2>Good for HOAs</h2>
  <ul>
    <li>Keeps parking from getting out of hand</li>
    <li>Makes it easy to manage owners and renters</li>
    <li>Can generate extra income when needed</li>
    <li>No more paper permits or guessing who belongs there</li>
  </ul>

  <p>
    Whether your HOA wants to reduce congestion, make parking more fair, or create a new revenue stream,
    this system keeps things easy for everyone.
  </p> */}


{/* 
<div style={{marginTop:"70px", textAlign:"center"}}>
  Version 3
</div>

 <h1>About the HOA Parking Management System</h1>

  <p>
    This web-based platform is designed to help Homeowners Associations efficiently manage residential
    parking. It provides a flexible and easy-to-use solution for both property owners and renters,
    without requiring the installation of a mobile application.
  </p>

  <h2>Purpose</h2>
  <p>
    HOAs frequently encounter challenges related to limited parking availability, particularly in
    high-demand resort and vacation communities. This system enables associations to reduce
    overcrowding, enforce parking policies, and, where appropriate, generate revenue from
    excess parking demand.
  </p>

  <h2>System Overview</h2>
  <ul>
    <li>Accessible through any modern web browser on phones, tablets, and computers</li>
    <li>Requires only a phone number and vehicle details for registration — no email address is needed</li>
    <li>Allows property owners to maintain an inventory of vehicles and designate occupancy dates</li>
    <li>Supports customizable parking rules for owners, renters, and additional vehicles</li>
    <li>Includes an administrative interface for managing rates, date ranges, and contact information</li>
  </ul>

  <h2>Key Features</h2>
  <ul>
    <li>Web-based access with no software installation required</li>
    <li>Configurable parking policies tailored to each HOA’s needs</li>
    <li>Secure storage of vehicle images, rules, and terms and conditions using Amazon Web Services</li>
    <li>Automated tracking of parking usage and availability</li>
    <li>Administrative controls for adjusting pricing and permitted dates</li>
  </ul>

  <h2>Benefits to the Association</h2>
  <ul>
    <li>Improves parking availability and fairness for residents and guests</li>
    <li>Reduces administrative overhead and eliminates the need for physical permits</li>
    <li>Provides a mechanism for managing peak demand periods</li>
    <li>Offers the option to create a new revenue stream through paid parking</li>
  </ul>

  <p>
    The HOA Parking Management System is built to support responsible and transparent parking
    practices, helping associations maintain order, improve resident satisfaction, and adapt
    to the unique demands of their communities.
  </p> */}


        <div className="button-grid">
          <button
            className="btnxs btn-secondary"
            onClick={() => navigate(hoaId ? `/${hoaId}` : "/")}
           
          >
            {hoaId ? "Back" : "Back"}
          </button>
        </div>
      </div>
    </div>
  );
}