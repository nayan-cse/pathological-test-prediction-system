
'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import html2pdf from 'html2pdf.js';

export default function ReportHistory() {
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get page from URL or default to 1
  const currentPage = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  // Function to update URL with pagination params
  const updateUrlParams = (page, limit) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    router.push(`?${params.toString()}`);
  };

  // Function to handle the GET request with pagination
  const handleGet = async (page = 1, itemsPerPage = 10) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("No token found. Please log in again.");
      setResponseData(null);
      router.push("/login"); // Redirect to login page
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/v1/patient/report-history?page=${page}&limit=${itemsPerPage}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setResponseData(result.data);
        setPagination(result.pagination);
        setError(null);
      } else {
        setError(result.error);
        setResponseData(null);
      }
    } catch (err) {
      console.error("Error during request:", err);
      setError("An error occurred while fetching data.");
      setResponseData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGet(currentPage, limit);
  }, [currentPage, limit]);

  // Function to navigate to a different page
  const changePage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      updateUrlParams(page, pagination.limit);
    }
  };

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
      // test_by_model: reportData.test_by_model,
      test_by_doctor: reportData.test_by_doctor,
      approved_by_name: reportData.approved_by_name
    };
    
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create HTML content for the PDF
    tempDiv.innerHTML = `
      <div id="pdf-content" style="width: 210mm; min-height: 290mm; max-height: 290mm; margin: 0 auto; position: relative; background-color: white; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
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
              <p style="font-weight: 600; font-size: 18px; color: #4b5563; border-bottom: 2px solid #9ca3af; padding-bottom: 4px;">Advice (Pathological Test):</p>
              <div style="margin-top: 8px;">
                <p>${patientData.test_by_doctor || "__________________"}</p>
                <div style="border-bottom: 1px solid #d1d5db; height: 20px;"></div>
                <div style="border-bottom: 1px solid #d1d5db; height: 20px;"></div>
              </div>
            </div>

            <!-- Reviewed By section with watermark - FIXED CSS -->
            <div style="margin-top: 32px; position: relative;">
              <p style="font-weight: 600; font-size: 18px; color: #4b5563; border-bottom: 2px solid #9ca3af; padding-bottom: 4px;">Reviewed By:</p>
              <div style="margin-top: 16px; height: 80px; border-bottom: 1px solid #d1d5db; position: relative;">
                <!-- Properly styled watermark -->
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 112px; height: 112px; opacity: 0.4;">
                  <!-- Outer ring -->
                  <div style="position: absolute; inset: 0; border-radius: 50%; border: 4px solid rgba(37, 99, 235, 0.1); transform: rotate(12deg);"></div>
                  <!-- Middle ring -->
                  <div style="position: absolute; inset: 8px; border-radius: 50%; border: 2px solid rgba(59, 130, 246, 0.1); transform: rotate(-6deg);"></div>
                  <!-- Inner circle -->
                  <div style="position: absolute; inset: 16px; border-radius: 50%; background-color: rgba(59, 130, 246, 0.05); display: flex; align-items: center; justify-content: center;">
                    <div style="text-align: center; opacity: 0.3;">
                      <span style="color: #1e40af; font-weight: 700; font-size: 18px; letter-spacing: 0.05em;">REVIEWED</span>
                      <div style="width: 64px; height: 1px; background-color: rgba(37, 99, 235, 0.2); margin: 4px auto;"></div>
                      <span style="color: #2563eb; font-size: 12px; font-weight: 500;">✓ Verified</span>
                    </div>
                  </div>
                </div>
                <p>${patientData.approved_by_name || "__________________"}</p>
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

  // Generate pagination buttons
  const renderPageButtons = () => {
    const { currentPage, totalPages } = pagination;
    const buttons = [];
    
    // Always show first page, last page, current page, and 1 page before and after current
    const pagesToShow = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    
    // Filter out invalid pages (less than 1 or greater than totalPages)
    const validPages = Array.from(pagesToShow).filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    
    // Add page buttons with ellipses for gaps
    let prevPage = 0;
    validPages.forEach(page => {
      if (page - prevPage > 1) {
        // Add ellipsis
        buttons.push(
          <span key={`ellipsis-${page}`} className="px-3 py-1 text-gray-500">...</span>
        );
      }
      
      buttons.push(
        <button
          key={page}
          onClick={() => changePage(page)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === page 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-blue-600 hover:bg-blue-100'
          }`}
        >
          {page}
        </button>
      );
      
      prevPage = page;
    });
    
    return buttons;
  };

  // Function to handle items per page change
  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    updateUrlParams(1, newLimit); // Reset to page 1 when changing limit
  };

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Report History</h1>

        {loading && 
          <div className="flex justify-center items-center p-4">
            <RefreshCw className="animate-spin text-blue-500 mr-2" />
            <p className="text-blue-500">Loading reports...</p>
          </div>
        }
        
        {error && 
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-600 text-center mb-4">
            {error}
          </div>
        }

        {responseData && (
          <>
            <div className="bg-white p-4 rounded-lg shadow mb-4 flex justify-between items-center">
              <div>
                <span className="text-gray-600">
                  Showing {responseData.length} of {pagination.total} reports
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="limitSelect" className="text-gray-600">Show:</label>
                <select 
                  id="limitSelect"
                  value={pagination.limit}
                  onChange={handleLimitChange}
                  className="border rounded p-1"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          
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
                  {responseData.map((item, index) => {
                    // Calculate the real index based on pagination
                    const realIndex = (pagination.currentPage - 1) * pagination.limit + index + 1;
                    
                    return (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4">{realIndex}</td>
                        <td className="py-3 px-4">{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{item.symptoms}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.isApprove === 0
                              ? "bg-yellow-100 text-yellow-800"
                              : item.isApprove === 1
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {item.isApprove === 0
                              ? "Reviewing"
                              : item.isApprove === 1
                              ? "Reviewed"
                              : "Pending"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            className={`flex items-center ${
                              item.isApprove === 1 
                                ? 'text-blue-500 hover:bg-blue-100'
                                : 'text-gray-400 bg-gray-100'
                            } py-2 px-4 rounded-lg transition-colors ${
                              item.isApprove === 1 ? '' : 'opacity-50 cursor-not-allowed'
                            }`}
                            disabled={item.isApprove !== 1}
                            onClick={() => handleDownload(item)}
                          >
                            <Download className="mr-2" size={18} />
                            {item.isApprove === 1 ? 'Download' : 'Pending'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 bg-white p-4 rounded-lg shadow">
                <button
                  onClick={() => changePage(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className={`flex items-center mr-2 px-3 py-1 rounded ${
                    pagination.hasPrevPage 
                      ? 'bg-white text-blue-600 hover:bg-blue-100'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft size={18} />
                  <span className="ml-1">Prev</span>
                </button>
                
                <div className="flex mx-2">
                  {renderPageButtons()}
                </div>
                
                <button
                  onClick={() => changePage(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`flex items-center ml-2 px-3 py-1 rounded ${
                    pagination.hasNextPage 
                      ? 'bg-white text-blue-600 hover:bg-blue-100'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="mr-1">Next</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
        
        {/* No data message */}
        {responseData && responseData.length === 0 && (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No reports found</p>
          </div>
        )}
      </div>
    </div>
  );
}