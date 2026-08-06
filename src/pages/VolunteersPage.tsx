import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Volunteers from "../components/Volunteers";
import { useAuth } from "../context/AuthContext";
import { UserProfile, Camp } from "../types";
import axios from 'axios';

export default function VolunteersPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user, updateUser } = useAuth();
  
  const [camps, setCamps] = useState<Camp[]>([]);

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const response = await axios.get('/api/health_camps');
        const data = response.data.camps || response.data.data;
        setCamps(data || []);
      } catch (error) {
        console.error("Health camps fetch error:", error);
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
    division: "Bhopal Ward 5",
    janSevaId: user?.id ? `JSC-${user.id.slice(-8).toUpperCase()}` : "GUEST-001",
    role: user?.isVolunteer ? "Active Volunteer" : "Citizen",
    points: 150,
    badge: user?.isVolunteer ? "Silver" : "Bronze",
  };

  const handleParticipateCamp = async (campId: string) => {
    try {
      const response = await axios.post('/api/health_camps/' + campId + '/register', {});
      if (response.data.success) {
        setCamps(prev => prev.map(c => c.id === campId ? { ...c, registeredCount: response.data.camp.registeredCount } : c));
      }
    } catch (error) {
      console.error("Participate error:", error);
    }
  };

  const handleRegisterVolunteer = async (skills: string) => {
    await updateUser({ isVolunteer: true, interests: skills.split(", ") });
    try {
      await axios.post('/api/volunteers', {
          userId: user?.id || "guest",
          name: user?.name || "Citizen",
          phone: user?.phone || "9999999999",
          skills: skills,
          registeredAt: new Date().toISOString()
        });
    } catch (error) {
      console.error("Register volunteer error:", error);
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
