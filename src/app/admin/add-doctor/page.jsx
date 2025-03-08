'use client';
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

const addDoctor = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    city: '',
    specialty: '',
    designation: '',
    gender: '',
  });

  const specialties = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Obstetrics & Gynecology',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Pulmonology',
    'Radiology',
    'Urology',
  ];

  const designations = [
    'Consultant',
    'Specialist',
    'Senior Specialist',
    'Associate Professor',
    'Professor',
    'Head of Department',
    'Resident',
    'Senior Resident',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Form validation
      if (Object.values(formData).some(value => value === '')) {
        toast.error('All fields are required');
        setLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Phone validation (simple check for now)
      if (formData.phone_number.length < 10) {
        toast.error('Please enter a valid phone number');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/v1/admin/addDoctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register doctor');
      }

      toast.success('Doctor registered successfully! An email with login details has been sent.');
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone_number: '',
        city: '',
        specialty: '',
        designation: '',
        gender: '',
      });

    } catch (error) {
      toast.error(error.message || 'An error occurred during registration');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Register New Doctor</h1>
            <p className="text-blue-100 mt-1">Add a new doctor to the system</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Full Name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="doctor@example.com"
                  required
                />
              </div>
            </div>
            
            {/* Phone & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0123456789"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Khulna"
                  required
                />
              </div>
            </div>
            
            {/* Specialty & Designation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                  Specialty <span className="text-red-500">*</span>
                </label>
                <select
                  id="specialty"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Specialty</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                  Designation <span className="text-red-500">*</span>
                </label>
                <select
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Designation</option>
                  {designations.map((designation) => (
                    <option key={designation} value={designation}>
                      {designation}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-6">
                <div className="flex items-center">
                  <input
                    id="male"
                    name="gender"
                    type="radio"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <label htmlFor="male" className="ml-2 text-sm text-gray-700">
                    Male
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="female"
                    name="gender"
                    type="radio"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="female" className="ml-2 text-sm text-gray-700">
                    Female
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="other"
                    name="gender"
                    type="radio"
                    value="other"
                    checked={formData.gender === "other"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="other" className="ml-2 text-sm text-gray-700">
                    Other
                  </label>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white 
                  ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Register Doctor'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default addDoctor;