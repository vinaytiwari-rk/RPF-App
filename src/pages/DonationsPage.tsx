import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Legacy compatibility redirect.
 * Donations is no longer an active page; old /donations links return to home.
 */
export default function DonationsPage() {
  return <Navigate to="/" replace />;
}
