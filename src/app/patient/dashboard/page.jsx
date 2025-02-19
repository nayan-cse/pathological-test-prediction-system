"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import LogoutButton from "@/app/components/logoutButton";

const PatientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch Patient Data from the API
  const fetchPatientData = async () => {
    try {
      // Get the token from local storage
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      const response = await fetch("/api/v1/patient/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send the token for verification
        },
      });

      const data = await response.json();

      if (response.ok) {
        setPatientData(data.patientData);
        setLoading(false);
      } else {
        throw new Error(data.error || "Something went wrong");
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
      toast.error(error.message);

      // Redirect to login if token is not available or invalid
      if (error.message === "No token found. Please log in again.") {
        router.push("/login"); // Redirect to the login page
      }
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        {/* Show the loading spinner */}
        <ClipLoader
          height={80}
          width={80}
          color="#4fa94d"
          loading={loading}
          aria-label="Loading..." // Correct ARIA attribute
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-semibold text-center text-gray-800 mb-6">
          Welcome, {patientData.name}!
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-medium text-gray-700">
                Patient Information
              </h2>
              <div className="mt-2">
                <p className="text-gray-600">
                  <strong>Email:</strong> {patientData.email}
                </p>
                <p className="text-gray-600">
                  <strong>Phone:</strong> {patientData.phone_number}
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-700">
                Medical History
              </h2>
              <div className="mt-2">
                <p className="text-gray-600">
                  <strong>Last Appointment:</strong>{" "}
                </p>
                <p className="text-gray-600">
                  <strong>Doctor's Notes:</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
};

export default PatientDashboard;
