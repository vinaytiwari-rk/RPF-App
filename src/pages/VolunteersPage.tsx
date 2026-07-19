import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Volunteers from "../components/Volunteers";
import { useAuth } from "../context/AuthContext";
import { UserProfile, Camp } from "../types";
import { supabase } from "../lib/supabaseClient";

export default function VolunteersPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user, updateUser } = useAuth();
  
  const [camps, setCamps] = useState<Camp[]>([]);

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const { data, error } = await supabase
          .from("camps")
          .select("*");
        if (error) throw error;
        setCamps(data || []);
      } catch (error) {
        console.error("Supabase camps fetch error:", error);
      }
    };
    fetchCamps();
  }, []);

  const profile: UserProfile = {
    name: user?.name || "Citizen",
    phone: user?.phone || "9999999999",
    email: user?.email || "citizen@rpfoundation.org",
    age: "24",
    gender: "Male",
    income: "150000",
    occupation: "Student",
    category: "General",
    division: "Sehore Ward 5",
    janSevaId: user?.id ? `JSC-${user.id.slice(-8).toUpperCase()}` : "GUEST-001",
    role: user?.isVolunteer ? "Active Volunteer" : "Citizen",
    points: 150,
    badge: user?.isVolunteer ? "Silver" : "Bronze",
  };

  const handleParticipateCamp = async (campId: string) => {
    try {
      const camp = camps.find(c => c.id === campId);
      const nextCount = (camp?.registeredCount || 0) + 1;
      
      const { error } = await supabase
        .from("camps")
        .update({ registeredCount: nextCount })
        .eq("id", campId);
      if (error) throw error;

      setCamps(prev => prev.map(c => c.id === campId ? { ...c, registeredCount: nextCount } : c));
    } catch (error) {
      console.error("Supabase participate error:", error);
    }
  };

  const handleRegisterVolunteer = async (skills: string) => {
    await updateUser({ isVolunteer: true, interests: skills.split(", ") });
    try {
      const { error } = await supabase
        .from("volunteers")
        .insert([{
          userId: user?.id || "guest",
          name: user?.name || "Citizen",
          phone: user?.phone || "9999999999",
          skills: skills,
          registeredAt: new Date().toISOString()
        }]);
      if (error) throw error;
    } catch (error) {
      console.error("Supabase register volunteer error:", error);
    }
  };

  return (
    <div className="p-4 pb-24">
      <Volunteers 
        lang={lang}
        profile={profile}
        camps={camps}
        onParticipateCamp={handleParticipateCamp}
        onRegisterVolunteer={handleRegisterVolunteer}
      />
    </div>
  );
}
