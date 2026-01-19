import React from "react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

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
          <h2 onClick={() => navigate("/")}>HOA Parking Solutions</h2>
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

        <div className="button-grid">
          <button
            className="btnxs btn-primary"
            onClick={() => navigate("/")}
           
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}