"use client";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out!");
      router.push("/login");
    } catch (error) {
      toast.error("Error logging out. Please try again.");
    }
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-0 text-white text-xl">Dashboard</div>
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4">
                {user?.role === "patient" && (
                  <>
                    <Link
                      href="/patient/previous-report"
                      className="text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Previous Report
                    </Link>
                    <Link
                      href="/patient/pending-report"
                      className="text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Pending Report
                    </Link>
                    <Link
                      href="/patient/make-appointment"
                      className="text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Make an Appointment
                    </Link>
                  </>
                )}

                {user?.role === "doctor" && (
                  <>
                    <Link
                      href="/doctor/report-request"
                      className="text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Report Request
                    </Link>
                    <Link
                      href="/doctor/reviewed-report"
                      className="text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Reviewed Report
                    </Link>
                  </>
                )}

                {user?.role === "admin" && (
                  <>
                    <Link
                      href="/admin/add-doctor"
                      className="text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Add Doctor
                    </Link>
                    <Link
                      href="/admin/doctors-panel"
                      className="text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Doctors Panel
                    </Link>
                    <Link
                      href="/admin/patients-panel"
                      className="text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Patient Panel
                    </Link>
                    <Link
                      href="/admin/total-report"
                      className="text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Total Report
                    </Link>
                  </>
                )}

                {user && (
                  <button
                    onClick={handleLogout}
                    className="text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
