"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import router from Next.js
import { Download } from "lucide-react"; // Assuming you're using lucide-react

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
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Report History</h1>

        {loading && <p className="text-center text-blue-500">Loading...</p>} {/* Show loading state */}
        {error && <p className="text-center text-red-500">{error}</p>} {/* Show error message */}

        {responseData && (
          <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
            <table className="min-w-full bg-white table-auto">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">SL</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Symptoms Reported</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {responseData.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{item.symptoms}</td>
                    <td className="py-3 px-4">
                      {item.isApprove === 0
                        ? "Reviewing"
                        : item.isApprove === 1
                        ? "Reviewed"
                        : "Pending"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        className={`flex items-center text-blue-500 hover:bg-blue-100 py-2 px-4 rounded-lg ${item.isApprove === 1 ? '' : 'opacity-50 cursor-not-allowed'}`}
                        disabled={item.isApprove !== 1}
                      >
                        <Download className="mr-2" />
                        {item.isApprove === 1 ? 'Download' : 'Pending'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportHistory;
