import React from "react";

export default function TableButton({ label, onClick,  className  }) {
  let type="button";
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

