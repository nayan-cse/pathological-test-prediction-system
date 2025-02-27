'use client';

import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import html2pdf from 'html2pdf.js';

const MedicalPrescription = forwardRef(({ reportData }, ref) => {
  // State to track if the component is mounted on the client side
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after the component mounts (client-side rendering)
  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Function to trigger PDF generation with improved settings
  const generatePDF = () => {
    if (isClient && typeof window !== 'undefined') {
      const element = document.getElementById('pdf-content');
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

      // Modify container before printing to ensure full A4 dimensions
      const originalStyle = element.style.cssText;
      element.style.width = '210mm'; // A4 width
      element.style.height = '297mm'; // A4 height
      element.style.margin = '0';
      element.style.padding = '0';

      html2pdf()
        .set(options)
        .from(element)
        .save()
        .then(() => {
          // Restore original styling after PDF generation
          element.style.cssText = originalStyle;
        });
    }
  };

  // Expose the generatePDF function to the parent component
  useImperativeHandle(ref, () => ({
    generatePDF
  }));

  return (
    <div className="flex flex-col items-center">
      <div
        id="pdf-content"
        className="w-full max-w-[210mm] bg-white shadow-xl overflow-hidden"
        style={{
          minHeight: '290mm', // Ensures content fits on one page
          maxHeight: '290mm', // Restricts content to A4 size
          width: '210mm', // A4 width
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Simplified Header - Only Patient Info */}
        <div className="flex justify-between bg-gray-50 p-4 border-b border-gray-300 text-sm font-medium">
          <p>Name: {reportData?.user_name || "__________________"}</p>
          <p>Age: {reportData?.user_dob || "__________________"}</p>
          <p>Sex: {reportData?.user_gender || "__________________"}</p>
          <p>Date: {currentDate}</p>
        </div>

        {/* Prescription Body */}
        <div className="flex bg-gray-50 flex-grow">
          {/* Left sidebar for patient info */}
          <div className="w-1/3 p-6 border-r border-gray-300">
            <div className="mb-6">
              <p className="font-semibold text-lg text-gray-700 border-b-2 border-gray-400 pb-1">Chief Complaints:</p>
              <div className="mt-4 space-y-2">
                <p>{reportData?.symptoms || "__________________"}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-semibold text-lg text-gray-700 border-b-2 border-gray-400 pb-1">On Examination:</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">BP:</span>
                  <div className="w-3/4 border-b border-gray-300"></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pulse:</span>
                  <div className="w-3/4 border-b border-gray-300"></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Temp:</span>
                  <div className="w-3/4 border-b border-gray-300"></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Weight:</span>
                  <div className="w-3/4 border-b border-gray-300"></div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <p className="font-semibold text-lg text-gray-700 border-b-2 border-gray-400 pb-1">Investigations:</p>
              <div className="mt-4 space-y-2">
                <div className="border-b border-gray-300 h-5"></div>
                <div className="border-b border-gray-300 h-5"></div>
              </div>
            </div>

            <div className="mb-8">
              <p className="font-semibold text-lg text-gray-700 border-b-2 border-gray-400 pb-1">Advice & Instructions:</p>
              <div className="mt-2 space-y-2">
                <p>{reportData?.test_by_model || "__________________"}</p>
                <div className="border-b border-gray-300 h-5"></div>
                <div className="border-b border-gray-300 h-5"></div>
              </div>
            </div>

            {/* Reviewed By section with watermark */}
            <div className="mt-8 relative">
              <p className="font-semibold text-lg text-gray-700 border-b-2 border-gray-400 pb-1">Reviewed By:</p>
              <div className="mt-4 h-20 border-b border-gray-300 relative">
                {/* Subtle Watermark Style Review Seal */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 opacity-40">
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-opacity-10 rotate-12"></div>

                  {/* Middle ring */}
                  <div className="absolute inset-2 rounded-full border-2 border-blue-500 border-opacity-10 -rotate-6"></div>

                  {/* Inner circle */}
                  <div className="absolute inset-4 rounded-full bg-blue-500 bg-opacity-5 flex items-center justify-center">
                    <div className="text-center opacity-30">
                      <span className="text-blue-700 font-bold text-lg tracking-wide">REVIEWED</span>
                      <div className="w-16 h-px bg-blue-600 bg-opacity-20 mx-auto my-1"></div>
                      <span className="text-blue-600 text-xs font-medium">✓ Verified</span>
                    </div>
                  </div>
                </div>
                <p>{reportData?.approved_by_name || "__________________"}</p>
              </div>
            </div>
          </div>

          {/* Right side for prescription */}
          <div className="w-2/3 p-6"> 
            <div className="min-h-[380px] border border-gray-300 rounded-lg p-6 bg-white h-full">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-green-500 shadow-md">
                  <span className="text-3xl font-serif font-bold text-white">Rx</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-500 to-transparent ml-4"></div>
              </div>

              {/* Prescription lines */}
              <div className="mt-6 space-y-5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <div key={num} className="border-b border-gray-200 pb-2 relative">
                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-xs text-gray-500">
                      {num}
                    </div>
                    <div className="ml-10 h-6"></div>
                  </div>
                ))}
              </div>

              {/* Doctor's Signature */}
              <div className="mt-10 flex justify-end">
                <div className="text-center">
                  <div className="w-48 border-b-2 border-gray-400"></div>
                  <p className="text-sm text-gray-600 mt-1">Doctor's Signature & Seal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simplified Footer - Just AI Generated Text */}
        <div className="py-3 px-6 text-center text-sm text-gray-500 italic">
          This is AI generated report
        </div>
      </div>

      {/* Generate PDF Button - Kept for manual triggering if needed */}
      {isClient && (
        <div className="flex justify-center p-4 mt-4">
          <button 
            onClick={generatePDF} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Generate PDF
          </button>
        </div>
      )}
    </div>
  );
});

// Add display name for better debugging
MedicalPrescription.displayName = "MedicalPrescription";

export default MedicalPrescription;