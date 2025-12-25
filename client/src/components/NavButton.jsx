import React from "react";

export default function NavButton({ label, onClick,  className ,which }) {
  let type="button";
  if (which === "goback") {
    className = "navbutton-goback";
  }
    return (
    <button
      type={type}
      className={className}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

