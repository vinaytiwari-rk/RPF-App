import React from "react";
import { useOutletContext } from "react-router-dom";
import Donations from "../components/Donations";
import { useAuth } from "../context/AuthContext";

export default function DonationsPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { updateUser } = useAuth();

  const handleDonationComplete = (amount: number) => {
    updateUser({ isDonor: true });
  };

  return (
    <div className="p-4 pb-24">
      <Donations 
        lang={lang}
        onDonationComplete={handleDonationComplete}
      />
    </div>
  );
}
