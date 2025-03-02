'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCw, X } from "lucide-react";

export default function ReviewedReport() {
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

  // Toast state
  const [toast, setToast] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // Custom toast implementation
  const showToast = (type, message) => {
    setToast({ type, message });
    
    // Auto-dismiss after 3 seconds
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
      const response = await fetch(`/api/v1/doctor/reviewed-report?page=${page}&limit=${itemsPerPage}`, {
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
    
    // Clear any toast when component unmounts
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
    updateUrlParams(1, newLimit); // Reset to page 1 when changing limit
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
            onClick={() => setToast(null)}
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
                        <td className="py-3 px-4">{item.test_by_doctor}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-4">
                <button 
                  onClick={() => changePage(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className={`px-4 py-2 ${!pagination.hasPrevPage ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-l`}
                >
                  Prev
                </button>
                
                {renderPageButtons()}
                
                <button 
                  onClick={() => changePage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`px-4 py-2 ${!pagination.hasNextPage ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-r`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
