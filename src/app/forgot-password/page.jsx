"use client";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address", { position: "top-center" });
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Reset link sent! Check your email.", {
          position: "top-center",
          autoClose: 5000,
        });
        setEmail("");
      } else {
        toast.error(data.message || "Failed to send reset link. Please try again.", { 
          position: "top-center" 
        });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.", { 
        position: "top-center" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <ToastContainer />
      <div className="bg-white p-6 sm:p-8 shadow-xl rounded-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Forgot Password
          </h2>
          <p className="text-gray-600 mt-2">
            Enter your email to receive a password reset link
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className={`w-full p-3 text-white rounded-lg font-medium transition-all duration-200 transform hover:translate-y-px ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Remembered your password?{" "}
            <a 
              href="/login" 
              className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
            >
              Login here
            </a>
          </p>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
          <p>
            Need help? <a href="/support" className="text-blue-600 hover:text-blue-800">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}