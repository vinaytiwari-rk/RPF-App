import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import HealthBlood from "../components/HealthBlood";
import { BloodDonor } from "../types";
import { supabase } from "../lib/supabaseClient";

export default function HealthPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const { data, error } = await supabase
          .from("blood_donors")
          .select("*");
        if (error) throw error;
        setDonors(data || []);
      } catch (error) {
        console.error("Error fetching blood donors from Supabase:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDonors();
  }, []);

  const handleAddDonor = async (newDonor: BloodDonor) => {
    try {
      const { error } = await supabase
        .from("blood_donors")
        .insert([newDonor]);
      if (error) throw error;
      setDonors(prev => [newDonor, ...prev]);
    } catch (error) {
      console.error("Error adding blood donor to Supabase:", error);
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
