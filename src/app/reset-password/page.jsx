// "use client";
// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function ResetPassword() {
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token"); // ✅ Get token from URL query

//   useEffect(() => {
//     if (!token) {
//       toast.error("Invalid or missing token.", { position: "top-right" });
//     }
//   }, [token]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!token) {
//       toast.error("Invalid or missing token.", { position: "top-right" });
//       return;
//     }

//     setLoading(true);
//     const res = await fetch("/api/v1/auth/reset-password", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ token, newPassword: password }),
//     });

//     const data = await res.json();
//     setLoading(false);

//     if (res.ok) {
//       toast.success("Password reset successful! Redirecting...", {
//         position: "top-right",
//       });
//       setTimeout(() => router.push("/login"), 2000);
//     } else {
//       toast.error(data.message, { position: "top-right" });
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <ToastContainer />
//       <div className="bg-white p-8 shadow-lg rounded-lg w-96">
//         <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
//           Reset Password
//         </h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="password"
//             placeholder="New Password"
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//           <button
//             type="submit"
//             className={`w-full p-3 text-white rounded-lg ${
//               loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
//             }`}
//             disabled={loading}
//           >
//             {loading ? "Resetting..." : "Reset Password"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token. Please request a new password reset link.", { 
        position: "top-center",
        autoClose: 5000 
      });
    }
  }, [token]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === "password") {
      checkPasswordStrength(value);
    }
  };
  
  const checkPasswordStrength = (password) => {
    // Simple password strength checker
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    
    const checks = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough];
    const passedChecks = checks.filter(Boolean).length;
    
    let message = "";
    let color = "";
    
    if (password.length === 0) {
      message = "";
      color = "";
    } else if (passedChecks <= 2) {
      message = "Weak";
      color = "bg-red-500";
    } else if (passedChecks <= 4) {
      message = "Medium";
      color = "bg-yellow-500";
    } else {
      message = "Strong";
      color = "bg-green-500";
    }
    
    setPasswordStrength({
      score: password.length ? (passedChecks / checks.length) * 100 : 0,
      message,
      color
    });
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Invalid or missing token.", { position: "top-center" });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.", { position: "top-center" });
      return;
    }
    
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.", { position: "top-center" });
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: formData.password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Password reset successful! Redirecting to login...", {
          position: "top-center",
          autoClose: 3000,
        });
        setTimeout(() => router.push("/login"), 3000);
      } else {
        toast.error(data.message || "Failed to reset password. Please try again.", { 
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
            Reset Password
          </h2>
          <p className="text-gray-600 mt-2">
            Create a new secure password for your account
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full p-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                minLength={8}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Password strength indicator */}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${passwordStrength.color} transition-all duration-300 ease-in-out`} 
                    style={{ width: `${passwordStrength.score}%` }}
                  ></div>
                </div>
                <p className={`text-sm ${
                  passwordStrength.message === "Weak" ? "text-red-600" : 
                  passwordStrength.message === "Medium" ? "text-yellow-600" : 
                  passwordStrength.message === "Strong" ? "text-green-600" : ""
                }`}>
                  {passwordStrength.message && `Password strength: ${passwordStrength.message}`}
                </p>
                <ul className="text-xs text-gray-500 pl-4 list-disc space-y-1">
                  <li className={formData.password.length >= 8 ? "text-green-600" : ""}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? "text-green-600" : ""}>
                    Contains uppercase letter
                  </li>
                  <li className={/[a-z]/.test(formData.password) ? "text-green-600" : ""}>
                    Contains lowercase letter
                  </li>
                  <li className={/\d/.test(formData.password) ? "text-green-600" : ""}>
                    Contains number
                  </li>
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? "text-green-600" : ""}>
                    Contains special character
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 block">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className={`w-full p-3 pl-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                required
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>
          </div>
          
          <button
            type="submit"
            className={`w-full p-3 text-white rounded-lg font-medium transition-all duration-200 transform hover:translate-y-px ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
            }`}
            disabled={loading || formData.password !== formData.confirmPassword}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Remember your password?{" "}
            <a 
              href="/login" 
              className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}