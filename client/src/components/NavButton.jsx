import React from "react";

export default function NavButton({ label, onClick,  className ,which ,disabled = false}) {
  let type="button";
  if (which === "goback") {
    className = "btns btn-cancel";
  } else if (which === "logout") {
    className = "btns btn-logout";
  } else {
    className = "btns btn-primary";
  }
  
    return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled = {disabled}
    >
      {label}
    </button>
  );
}

