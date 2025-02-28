"use client";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out!");
      router.push("/login");
    } catch (error) {
      toast.error("Error logging out. Please try again.");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-white font-bold text-xl tracking-tight">
                Pathological Test System
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Display Register and Login only when no user is logged in */}
            {!user ? (
              <>
                <Link
                  href="/register"
                  className="text-gray-200 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="bg-blue-500 text-white hover:bg-blue-400 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                {/* Show user-specific links */}
                {user?.role === "patient" && (
                  <>
                    <Link
                      href="/patient/report-history"
                      className="text-gray-200 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                    >
                      Report History
                    </Link>
                    <Link
                      href="/patient/make-report"
                      className="text-gray-200 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                    >
                      Make an Appointment
                    </Link>
                  </>
                )}

                {user?.role === "doctor" && (
                  <>
                    <Link
                      href="/doctor/report-request"
                      className="text-gray-200 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                    >
                      Report Request
                    </Link>
                    <Link
                      href="/doctor/reviewed-report"
                      className="text-gray-200 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                    >
                      Reviewed Report
                    </Link>
                  </>
                )}

                {user?.role === "admin" && (
                  <>
                    <Link
                      href="/admin/add-doctor"
                      className="text-gray-200 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                    >
                      Add Doctor
                    </Link>
                    <Link
                      href="/admin/doctors-panel"
                      className="text-gray-200 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                    >
                      Doctors Panel
                    </Link>
                    <Link
                      href="/admin/patients-panel"
                      className="text-gray-200 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                    >
                      Patient Panel
                    </Link>
                    <Link
                      href="/admin/total-report"
                      className="text-gray-200 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                    >
                      Total Report
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-200 hover:bg-red-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-blue-700 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700">
          {/* Display Register and Login only when no user is logged in */}
          {!user ? (
            <>
              <Link
                href="/register"
                className="text-gray-200 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={toggleMenu}
              >
                Register
              </Link>
              <Link
                href="/login"
                className="text-gray-200 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={toggleMenu}
              >
                Login
              </Link>
            </>
          ) : (
            <>
              {/* Show user-specific links */}
              {user?.role === "patient" && (
                <>
                  <Link
                    href="/patient/report-history"
                    className="text-gray-200 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={toggleMenu}
                  >
                    Report History
                  </Link>
                  <Link
                    href="/patient/make-report"
                    className="text-gray-200 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={toggleMenu}
                  >
                    Make an Appointment
                  </Link>
                </>
              )}

              {user?.role === "doctor" && (
                <>
                  <Link
                    href="/doctor/report-request"
                    className="text-gray-200 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={toggleMenu}
                  >
                    Report Request
                  </Link>
                  <Link
                    href="/doctor/reviewed-report"
                    className="text-gray-200 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={toggleMenu}
                  >
                    Reviewed Report
                  </Link>
                </>
              )}

              {user?.role === "admin" && (
                <>
                  <Link
                    href="/admin/add-doctor"
                    className="text-gray-200 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={toggleMenu}
                  >
                    Add Doctor
                  </Link>
                  <Link
                    href="/admin/doctors-panel"
                    className="text-gray-200 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={toggleMenu}
                  >
                    Doctors Panel
                  </Link>
                  <Link
                    href="/admin/patients-panel"
                    className="text-gray-200 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={toggleMenu}
                  >
                    Patient Panel
                  </Link>
                  <Link
                    href="/admin/total-report"
                    className="text-gray-200 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={toggleMenu}
                  >
                    Total Report
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="text-gray-200 hover:bg-red-600 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
