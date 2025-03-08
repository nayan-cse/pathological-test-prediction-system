'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCw, CheckCircle, Edit, ChevronLeft, ChevronRight, X, Search } from "lucide-react";

export default function ReportRequest() {
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
  const [toast, setToast] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editedTest, setEditedTest] = useState("");

  // New state for test selection
  const [availableTests, setAvailableTests] = useState([
    "ANA", "ANA (Antinuclear Antibody)", "Abdominal Ultrasound (USG Abdomen)",
    "Allergy Test", "Amylase/Lipase", "Bilirubin Test", "Blood Culture",
    "Blood Glucose Test", "Blood Pressure Monitoring", "Bone Scan", "CBC",
    "CPK (Creatine Phosphokinase)", "CRP", "CT Scan Head", "CT/MRI",
    "CT/MRI Head", "Calcium Test", "Chest X-Ray", "Colonoscopy", "Cortisol",
    "D-Dimer", "Dengue Test", "Doppler Ultrasound", "ECG", "ESR",
    "Electrolyte Panel", "Electromyography (EMG)", "Endoscopy",
    "Endoscopy (if persistent)", "Eye Examination", "Ferritin", "Genetic Testing",
    "HIV Test", "HbA1c", "Hepatitis B and C Tests", "Hormone Profile",
    "IgE (Immunoglobulin E)", "Iron Studies", "Kidney Function Test",
    "Lipid Profile", "Liver Function Test", "Lymph Node Biopsy", "MRI",
    "MRI Brain", "MRI Hip", "MRI Knee", "MRI Neck", "MRI Spine",
    "Malaria Antigen Test", "Nerve Conduction Study", "PT/INR",
    "Pelvic Ultrasound", "Peripheral Blood Flow Studies", "Platelet Count",
    "Rheumatoid Factor", "Rheumatoid Factor (RF)", "Skin Biopsy",
    "Skin Examination", "Skin Swab Culture", "Sputum Culture", "Stool Culture",
    "Stool Occult Blood Test", "Stool Test", "TSH (Thyroid Stimulating Hormone)",
    "Throat Swab Culture", "Thyroid Panel", "Total Bilirubin", "Troponin",
    "USG Abdomen", "Ultrasound", "Ultrasound of Thyroid", "Urine Culture",
    "Urine RME", "VDRL", "Vitamin B12 Test", "X-Ray", "X-Ray Hip",
    "X-Ray Knee", "X-Ray Neck", "X-Ray Spine"
  ]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // Keep all the existing functions
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const updateUrlParams = (page, limit) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    router.push(`?${params.toString()}`);
  };

  const handleGet = async (page = 1, itemsPerPage = 10) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("No token found. Please log in again.");
      setResponseData(null);
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/v1/doctor/report-request?page=${page}&limit=${itemsPerPage}`, {
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
        setError(result.error || 'No Report Request available');
        setResponseData(null);
        showToast('error', result.error || 'No Report Request available');
      }
    } catch (err) {
      console.error("Error during request:", err);
      setError("An error occurred while fetching data.");
      setResponseData(null);
      showToast('error', "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGet(currentPage, limit);
    
    return () => {
      setToast(null);
    };
  }, [currentPage, limit]);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    return `${years} years, ${months < 0 ? 12 + months : months} months`;
  };

  const changePage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      updateUrlParams(page, pagination.limit);
    }
  };

  const renderPageButtons = () => {
    const { currentPage, totalPages } = pagination;
    const buttons = [];
    const pagesToShow = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    const validPages = Array.from(pagesToShow).filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    
    let prevPage = 0;
    validPages.forEach(page => {
      if (page - prevPage > 1) {
        buttons.push(<span key={`ellipsis-${page}`} className="px-3 py-1 text-gray-500">...</span>);
      }
      
      buttons.push(
        <button
          key={page}
          onClick={() => changePage(page)}
          className={`px-3 py-1 mx-1 rounded ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-100'}`}
        >
          {page}
        </button>
      );
      prevPage = page;
    });

    return buttons;
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    updateUrlParams(1, newLimit);
  };

  // Approve functionality
  const handleApprove = (item) => {
    setSelectedReport(item);
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("No token found.");
      showToast('error', "No authentication token found. Please log in again.");
      return;
    }

    const userId = localStorage.getItem("userId");
    const { id, test_by_model } = selectedReport;

    const bodyData = {
      reportId: id,
      approvedBy: userId,
      testByModel: test_by_model,
    };

    try {
      const response = await fetch('/api/v1/doctor/report-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      const result = await response.json();

      if (response.ok) {
        setIsApproveModalOpen(false);
        showToast('success', "Report approved successfully!");
        handleGet(currentPage, limit);
      } else {
        console.error("Error during approval:", result.error);
        showToast('error', result.error || "Failed to approve report");
      }
    } catch (error) {
      console.error("API request error:", error);
      showToast('error', "An error occurred while approving the report");
    }
  };

  // Modified Edit functionality
  const handleEdit = (item) => {
    setSelectedReport(item);
    
    // Parse the existing tests from test_by_model
    const existingTests = item.test_by_model
      .split(',')
      .map(test => test.trim())
      .filter(test => test.length > 0);
      
    setSelectedTests(existingTests);
    setEditedTest(item.test_by_model);
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("No token found.");
      showToast('error', "No authentication token found. Please log in again.");
      return;
    }

    const userId = localStorage.getItem("userId");
    const { id } = selectedReport;

    // Convert the selectedTests array to a comma-separated string
    const updatedTestByModel = selectedTests.join(', ');

    const bodyData = {
      reportId: id,
      approvedBy: userId,
      testByModel: updatedTestByModel,
    };

    try {
      const response = await fetch('/api/v1/doctor/report-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      const result = await response.json();

      if (response.ok) {
        setIsEditModalOpen(false);
        showToast('success', "Report updated successfully!");
        handleGet(currentPage, limit);
      } else {
        console.error("Error during edit:", result.error);
        showToast('error', result.error || "Failed to update report");
      }
    } catch (error) {
      console.error("API request error:", error);
      showToast('error', "An error occurred while updating the report");
    }
  };

  // New function to handle checkbox changes
  const handleTestChange = (test) => {
    setSelectedTests(prev => {
      if (prev.includes(test)) {
        // If already selected, remove it
        return prev.filter(t => t !== test);
      } else {
        // If not selected, add it
        return [...prev, test];
      }
    });
  };

  // Function to filter tests based on search query
  const filteredTests = availableTests.filter(test => 
    test.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle modal close functions
  const handleCloseApproveModal = () => {
    setIsApproveModalOpen(false);
    setSelectedReport(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedReport(null);
    setSelectedTests([]);
    setEditedTest("");
    setSearchQuery("");
  };

  // Close toast manually
  const handleCloseToast = () => {
    setToast(null);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-100 min-h-screen">
      {/* Custom Toast */}
      {toast && (
        <div 
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center justify-between max-w-md ${
            toast.type === 'success' ? 'bg-green-100 text-green-800 border-green-300' : 
            toast.type === 'error' ? 'bg-red-100 text-red-800 border-red-300' : 
            'bg-blue-100 text-blue-800 border-blue-300'
          }`}
        >
          <span>{toast.message}</span>
          <button 
            onClick={handleCloseToast}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
      )}
      
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
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Age</th>
                    <th className="py-3 px-4 text-left">Gender</th>
                    <th className="py-3 px-4 text-left">Symptoms Reported</th>
                    <th className="py-3 px-4 text-left">Test Given</th>
                    <th className="py-3 px-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {responseData.map((item, index) => {
                    const realIndex = (pagination.currentPage - 1) * pagination.limit + index + 1;
                    return (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4">{realIndex}</td>
                        <td className="py-3 px-4">{item.user_name}</td>
                        <td className="py-3 px-4">{calculateAge(item.user_dob)}</td>
                        <td className="py-3 px-4">{item.user_gender}</td>
                        <td className="py-3 px-4">{item.symptoms}</td>
                        <td className="py-3 px-4">{item.test_by_model}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <button
                              className="text-blue-500 hover:bg-blue-100 p-2 rounded-lg transition-colors flex items-center"
                              onClick={() => handleApprove(item)}
                            >
                              <CheckCircle size={20} />
                              <span className="ml-1">Approve</span>
                            </button>
                            <button
                              className="text-yellow-500 hover:bg-yellow-100 p-2 rounded-lg transition-colors flex items-center"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit size={20} />
                              <span className="ml-1">Edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

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

        {/* Approve Modal */}
        {isApproveModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Confirm Approval</h3>
                <button onClick={handleCloseApproveModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">Are you sure you want to approve this report?</p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseApproveModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmApprove}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Yes, Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Edit Modal with checkboxes */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Edit Test Information</h3>
                <button onClick={handleCloseEditModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="font-medium text-gray-700">Selected Tests: {selectedTests.length}</p>
                {selectedTests.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md max-h-32 overflow-y-auto">
                    <p className="text-sm text-blue-800">{selectedTests.join(', ')}</p>
                  </div>
                )}
              </div>
              
              <div className="mb-4 relative">
                <div className="flex items-center border border-gray-300 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500">
                  <Search size={20} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full focus:outline-none"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md p-2 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredTests.map((test, index) => (
                    <div key={index} className="flex items-center p-2 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        id={`test-${index}`}
                        checked={selectedTests.includes(test)}
                        onChange={() => handleTestChange(test)}
                        className="h-5 w-5 text-blue-600 rounded"
                      />
                      <label htmlFor={`test-${index}`} className="ml-2 cursor-pointer flex-1">
                        {test}
                      </label>
                    </div>
                  ))}
                </div>
                {filteredTests.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No tests found matching your search
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmEdit}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}