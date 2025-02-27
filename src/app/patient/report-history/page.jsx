
'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import html2pdf from 'html2pdf.js';

const ReportHistory = () => {
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Function to handle the GET request
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
  }, []);

  // Function to calculate age from DOB
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    return `${years} years, ${months < 0 ? 12 + months : months} months`;
  };

  const generatePrescriptionPDF = (reportData) => {
    // Create a temporary invisible div to render the prescription
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);
    
    // Extract the relevant data from the report
    const patientData = {
      user_name: reportData.user_name,
      user_dob: calculateAge(reportData.user_dob), 
      user_gender: reportData.user_gender,
      symptoms: reportData.symptoms,
      test_by_model: reportData.test_by_model,
      approved_by_name: reportData.approved_by_name
    };
    
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create HTML content for the PDF
    tempDiv.innerHTML = `
      <div id="pdf-content" className="w-full max-w-[210mm] bg-white shadow-xl overflow-hidden"
        style={{
          minHeight: '290mm', // Ensures content fits on one page
          maxHeight: '290mm', // Restricts content to A4 size
          width: '210mm', // A4 width
          margin: '0 auto',
          position: 'relative',
        }}>
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; background-color: #f9fafb; padding: 16px; border-bottom: 1px solid #d1d5db; font-size: 14px; font-weight: 500;">
          <p>Name: ${patientData.user_name || "__________________"}</p>
          <p>Age: ${patientData.user_dob || "__________________"}</p>
          <p>Sex: ${patientData.user_gender || "__________________"}</p>
          <p>Date: ${currentDate}</p>
        </div>

        <!-- Body -->
        <div style="display: flex; background-color: #f9fafb; flex-grow: 1;">
          <!-- Left sidebar -->
          <div style="width: 33.333%; padding: 24px; border-right: 1px solid #d1d5db;">
            <div style="margin-bottom: 24px;">
              <p style="font-weight: 600; font-size: 18px; color: #4b5563; border-bottom: 2px solid #9ca3af; padding-bottom: 4px;">Chief Complaints:</p>
              <div style="margin-top: 16px;">
                <p>${patientData.symptoms || "__________________"}</p>
              </div>
            </div>

            <div style="margin-bottom: 24px;">
              <p style="font-weight: 600; font-size: 18px; color: #4b5563; border-bottom: 2px solid #9ca3af; padding-bottom: 4px;">On Examination:</p>
              <div style="margin-top: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 14px; color: #4b5563;">BP:</span>
                  <div style="width: 75%; border-bottom: 1px solid #d1d5db;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 14px; color: #4b5563;">Pulse:</span>
                  <div style="width: 75%; border-bottom: 1px solid #d1d5db;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 14px; color: #4b5563;">Temp:</span>
                  <div style="width: 75%; border-bottom: 1px solid #d1d5db;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 14px; color: #4b5563;">Weight:</span>
                  <div style="width: 75%; border-bottom: 1px solid #d1d5db;"></div>
                </div>
              </div>
            </div>

            <div style="margin-bottom: 32px;">
              <p style="font-weight: 600; font-size: 18px; color: #4b5563; border-bottom: 2px solid #9ca3af; padding-bottom: 4px;">Investigations:</p>
              <div style="margin-top: 16px;">
                <div style="border-bottom: 1px solid #d1d5db; height: 20px;"></div>
                <div style="border-bottom: 1px solid #d1d5db; height: 20px;"></div>
              </div>
            </div>

            <div style="margin-bottom: 32px;">
              <p style="font-weight: 600; font-size: 18px; color: #4b5563; border-bottom: 2px solid #9ca3af; padding-bottom: 4px;">Advice & Instructions:</p>
              <div style="margin-top: 8px;">
                <p>${patientData.test_by_model || "__________________"}</p>
                <div style="border-bottom: 1px solid #d1d5db; height: 20px;"></div>
                <div style="border-bottom: 1px solid #d1d5db; height: 20px;"></div>
              </div>
            </div>

            <!-- Reviewed By section -->
            <div style="margin-top: 32px; position: relative;">
              <p style="font-weight: 600; font-size: 18px; color: #4b5563; border-bottom: 2px solid #9ca3af; padding-bottom: 4px;">Reviewed By:</p>
              <div style="margin-top: 16px; height: 80px; border-bottom: 1px solid #d1d5db; position: relative;">
                <p>${patientData.approved_by_name || "__________________"}</p>
                <!-- Watermark (not included in pure HTML, will be visually simple) -->
              </div>
            </div>
          </div>

          <!-- Right side -->
          <div style="width: 66.666%; padding: 24px;">
            <div style="min-height: 380px; border: 1px solid #d1d5db; border-radius: 8px; padding: 24px; background-color: white; height: 100%;">
              <div style="display: flex; align-items: center; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 9999px; background-image: linear-gradient(to bottom right, #2563eb, #10b981); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <span style="font-size: 30px; font-family: serif; font-weight: bold; color: white;">Rx</span>
                </div>
                <div style="flex: 1; height: 1px; background-image: linear-gradient(to right, #3b82f6, transparent); margin-left: 16px;"></div>
              </div>

              <!-- Prescription lines -->
              <div style="margin-top: 24px;">
                ${Array.from({length: 12}, (_, i) => `
                  <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; position: relative; margin-bottom: 20px;">
                    <div style="position: absolute; left: 0; top: 0; width: 24px; height: 24px; border-radius: 9999px; background-color: #f3f4f6; border: 1px solid #d1d5db; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #6b7280;">
                      ${i + 1}
                    </div>
                    <div style="margin-left: 40px; height: 24px;"></div>
                  </div>
                `).join('')}
              </div>

              <!-- Doctor's Signature -->
              <div style="margin-top: 40px; display: flex; justify-content: flex-end;">
                <div style="text-align: center;">
                  <div style="width: 192px; border-bottom: 2px solid #9ca3af;"></div>
                  <p style="font-size: 14px; color: #4b5563; margin-top: 4px;">Doctor's Signature & Seal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 12px 24px; text-align: center; font-size: 14px; color: #6b7280; font-style: italic;">
          This is AI generated report
        </div>
      </div>
    `;

    // Get the element to convert to PDF
    const element = tempDiv.querySelector('#pdf-content');
    
    // PDF generation options
    const options = {
      filename: 'Medical_Prescription.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true,
      },
      margin: [0, 0, 0, 0],
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    // Generate and download the PDF
    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => {
        // Clean up - remove the temporary div
        document.body.removeChild(tempDiv);
      });
  };

  const handleDownload = (report) => {
    // Pass the report data directly to the PDF generator function
    generatePrescriptionPDF(report);
  };

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
                        onClick={() => handleDownload(item)} // Pass report data directly to download handler
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

