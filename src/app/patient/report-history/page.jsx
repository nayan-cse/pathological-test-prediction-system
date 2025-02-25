"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import router from Next.js

const ReportHistory = () => {
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGet = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("No token found. Please log in again.");
      setResponseData(null);
      router.push("/login"); // Redirect to login page
      return;
    }

    setLoading(true); // Set loading state to true when starting the request

    try {
      const response = await fetch("/api/v1/patient/report-history", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Pass token in Authorization header
        },
      });

      const result = await response.json();

      if (response.ok) {
        setResponseData(result.data); // Set the response data if successful
        setError(null); // Clear any previous errors
      } else {
        setError(result.error); // Set the error if the request fails
        setResponseData(null);
      }
    } catch (err) {
      console.error("Error during request:", err);
      setError("An error occurred while fetching data.");
      setResponseData(null);
    } finally {
      setLoading(false); // Set loading state to false when done
    }
  };

  useEffect(() => {
    handleGet(); // Fetch data when the component loads
  }, []); // Empty array means this will run once on component mount

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Report History</h1>

      {loading && <p>Loading...</p>} {/* Show loading state */}
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Show error message */}

      {responseData && (
        <div className="mt-4">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">SL</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Symptoms Reported</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {responseData.map((item, index) => (
                <tr key={index} className="odd:bg-gray-50">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="border p-2">{item.symptoms}</td>
                  <td className="border p-2">{item.status || "Pending"}</td>
                  <td className="border p-2">
                    <button className="text-blue-500 hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportHistory;
