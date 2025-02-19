"use client";

import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");

    if (token && role) {
      setUser({ role });
    } else {
      setUser(null);
    }
  };

  const login = (accessToken, role) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("role", role);
    setUser({ role });
  };

  const logout = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      if (token) {
        const response = await fetch("/api/v1/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Logout failed");
        }
      }

      // Clear local storage and state regardless of API response
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      setUser(null);

      return true;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
