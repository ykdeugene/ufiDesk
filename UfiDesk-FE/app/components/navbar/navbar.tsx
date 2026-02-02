import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSessionStatus, useLogout } from "~/api/hooks";

interface NavItem {
  label: string;
  path: string;
}

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const { data: sessionData } = useSessionStatus();
  const logout = useLogout();

  // Check if session is valid, if not redirect to login
  useEffect(() => {
    if (sessionData === null) {
      navigate("/login");
    }
  }, [sessionData, navigate]);

  const navItems: NavItem[] = [
    { label: "Upload Floorplan", path: "/admin/upload-floorplan" },
    { label: "User Management", path: "/admin/user-management" },
    { label: "Floorplan Details", path: "/admin/floorplan-details" },
  ];

  // Sort nav items: current page first, then alphabetically
  const sortedNavItems = [...navItems].sort((a, b) => {
    const aIsCurrent = location.pathname === a.path;
    const bIsCurrent = location.pathname === b.path;

    if (aIsCurrent) return -1;
    if (bIsCurrent) return 1;
    return a.label.localeCompare(b.label);
  });

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
      onError: () => {
        // Even if logout fails, redirect to login
        navigate("/login");
      },
    });
  };

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Navigation Items */}
          <div className="flex items-center gap-1">
            {sortedNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`text-gray-700 px-4 py-2 font-medium transition-all border-b-2 ${
                  location.pathname === item.path
                    ? "border-gray-700"
                    : "border-transparent hover:border-gray-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side - Username with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
            >
              <span>{sessionData?.email || "Loading..."}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 transition-all duration-200 ease-out">
                {/* Admin Mode Toggle */}
                <div className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    Admin Mode
                  </span>
                  <button
                    onClick={toggleAdminMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isAdminMode ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        isAdminMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-1" />

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
