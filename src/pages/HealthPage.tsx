import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import HealthBlood from "../components/HealthBlood";
import { BloodDonor } from "../types";
import axios from 'axios';

export default function HealthPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const response = await axios.get('/api/blood_donors'); const data = response.data.data || response.data.blood_donors; const error = null;
        if (error) throw error;
        setDonors(data || []);
      } catch (error) {
        console.error("Error fetching blood donors from backend:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDonors();
  }, []);

  const handleAddDonor = async (newDonor: BloodDonor) => {
    try {
      await axios.post('/api/blood_donors', newDonor); const error = null;
      if (error) throw error;
      setDonors(prev => [newDonor, ...prev]);
    } catch (error) {
      console.error("Error adding blood donor to backend:", error);
    }
  };

  return (
    <div className="p-4 pb-24">
      <HealthBlood 
        lang={lang}
        donors={donors}
        onAddDonor={handleAddDonor}
      />
    </div>
  );
}
