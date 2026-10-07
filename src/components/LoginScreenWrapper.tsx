import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginScreen from './LoginScreen';

export default function LoginScreenWrapper() {
  const { isAuthenticated, login, loginAsGuest, language } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  if (isAuthenticated) return null;

  return (
    <LoginScreen
      lang={language}
      onLoginSuccess={async (role, details) => {
        if (role === "guest") {
          await loginAsGuest();
        } else {
          await login({
            id: details?.id,
            role: (details?.role || (role === "admin" ? "admin" : "user")) as any,
            name: details?.name ?? "User",
            phone: details?.phone,
            isVolunteer: details?.role === "volunteer" || role === "volunteer",
            isDonor: details?.role === "volunteer" || role === "volunteer",
            janSevaCardStatus: "none"
          }, details?.token, details?.remember !== false);
        }
      }}
    />
  );
}
