import React from "react";
import { GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PeoplesUniversity() {
  const navigate = useNavigate();
  const url = "https://www.peoplesuniversity.edu.in/";
  React.useEffect(() => {
    navigate(`/browser?url=${encodeURIComponent(url)}`, { replace: true });
  }, [navigate]);
  return null;
}
