"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";

const ReportMaker = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const router = useRouter();

  // Get the current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];

  // Fetch Report Data from the API
  const fetchReportData = async () => {
    if (!startDate || !endDate) {
      // Don't fetch if dates aren't provided, but don't show loading either
      if (!searchPerformed) {
        setLoading(false);
        return;
      }
    }
    
    setLoading(true);
    try {
      // Get the token from local storage
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      const response = await fetch(`/api/v1/admin/total-report?startDate=${startDate}&endDate=${endDate}&page=${page}&perPage=${perPage}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setReportData(data.reportData || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(Math.ceil((data.totalCount || 0) / perPage));
        setLoading(false);
      } else {
        throw new Error(data.error || "Something went wrong");
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
      toast.error(error.message);

      // Redirect to login if token is not available or invalid
      if (error.message === "No token found. Please log in again." || 
          error.message.includes("token") || 
          error.message.includes("unauthorized")) {
        router.push("/login");
      }
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault(); // Prevent form submission
    
    if (!startDate || !endDate) {
      toast.warn("Please select both start date and end date");
      return;
    }
    
    // Validate that startDate isn't greater than endDate
    if (new Date(startDate) > new Date(endDate)) {
      toast.warn("Start date cannot be greater than end date");
      return;
    }
    
    setPage(1); // Reset to first page on search
    setSearchPerformed(true);
    fetchReportData();
  };

  // Only fetch data when page or perPage changes and a search has been performed
  useEffect(() => {
    if (searchPerformed) {
      fetchReportData();
    }
  }, [page, perPage]);

  // Reset search when component mounts
  useEffect(() => {
    setLoading(false);
  }, []);

  const downloadCSV = () => {
    if (!reportData || reportData.length === 0) {
      toast.warn("No data to download");
      return;
    }

    const headers = ["S.L", "Symptoms", "Tested By"];
    const rows = reportData.map((report, index) => [
      (page - 1) * perPage + index + 1,
      (report.symptoms || "N/A").replace(/,/g, ";"), // Replace commas with semicolons to avoid CSV issues
      (report.test_by_doctor || "N/A").replace(/,/g, ";"),
    ]);

    // Combine headers and data
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(","))
    ].join("\n");

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `report_data_${startDate}_to_${endDate}.csv`; // Better file name with date range
    link.click();
  };

  // Calculate displayed items range
  const startItem = reportData.length ? (page - 1) * perPage + 1 : 0;
  const endItem = Math.min(page * perPage, totalCount);

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Medical Reports</h1>
        
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                max={endDate || currentDate}
                required
              />
            </div>
            
            <div className="flex-1">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                min={startDate}
                max={currentDate}
                required
              />
            </div>
            
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-16">
            <ClipLoader
              size={60}
              color="#3B82F6"
              loading={loading}
              aria-label="Loading..."
            />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
            <p className="text-lg font-medium">Error: {error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {reportData && reportData.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">S.L</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Symptoms</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Tested By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.map((report, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-700">{(page - 1) * perPage + index + 1}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{report.symptoms || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{report.test_by_doctor || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{" "}
                      <span className="font-medium">{totalCount}</span> results
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <select
                        value={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                        className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                        <option value="25">25 per page</option>
                        <option value="50">50 per page</option>
                      </select>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setPage(1)}
                          disabled={page <= 1}
                          className="p-1.5 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="First page"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M7.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L3.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setPage(page > 1 ? page - 1 : 1)}
                          disabled={page <= 1}
                          className="p-1.5 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Previous page"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <span className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm">
                          {page} / {totalPages || 1}
                        </span>
                        
                        <button
                          onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                          disabled={page >= totalPages}
                          className="p-1.5 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Next page"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setPage(totalPages)}
                          disabled={page >= totalPages}
                          className="p-1.5 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Last page"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 6.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M12.293 15.707a1 1 0 010-1.414L16.586 10l-4.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                {searchPerformed ? (
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-700">No reports found</p>
                    <p className="text-gray-500 mt-1">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-700">Select a date range</p>
                    <p className="text-gray-500 mt-1">Choose start and end dates to view reports</p>
                  </div>
                )}
              </div>
            )}
            
            {reportData && reportData.length > 0 && (
              <div className="p-4 bg-white border-t border-gray-200">
                <button
                  onClick={downloadCSV}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-300 font-medium w-full sm:w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download CSV
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportMaker;