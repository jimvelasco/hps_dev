import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");
   // console.log("ProtectedRoute checking children", children);

    // If no token exists, redirect to login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // If token exists, render the protected component
    return children;
}