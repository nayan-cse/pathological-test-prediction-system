"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LogoutButton = () => {
  const router = useRouter();

  // Logout function to call the API and log the user out
  const handleLogout = async () => {
    try {
      // Get the token from local storage
      const token = localStorage.getItem("accessToken");

      if (!token) {
        // If no token is found, log the user out automatically
        toast.info("No token found. Logging you out.");
        localStorage.removeItem("accessToken"); // Ensure token is removed from localStorage
        router.push("/login"); // Redirect to login page
        return;
      }

      const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send the token for verification
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Show success toast if logout was successful
        toast.success(data.message || "Successfully logged out!");

        // Remove token from localStorage and redirect
        localStorage.removeItem("accessToken");
        router.push("/login");
      } else {
        // Show error toast if the API response indicates an error
        toast.error(data.error || "Logout failed. Please try again.");
      }
    } catch (error) {
      // Show error toast if there was an issue making the request
      toast.error("Error logging out. Please try again.");
    }
  };

  return (
    <div className="text-center mt-6">
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default LogoutButton;
