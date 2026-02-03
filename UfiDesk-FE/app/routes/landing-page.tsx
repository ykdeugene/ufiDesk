import { useNavigate } from "react-router";
import { useSessionStatus } from "~/api/hooks";
import { ProtectedRoute } from "~/components/ProtectedRoute";

export function LandingPage() {
  return (
    <ProtectedRoute>
      <LandingPageContent />
    </ProtectedRoute>
  );
}

function LandingPageContent() {
  const { data: sessionData } = useSessionStatus();
  const navigate = useNavigate();
  const isAdmin = sessionData?.admin === true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="border-l-4 border-blue-600 pl-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              Welcome to UfiDesk! 👋
            </h1>
            <p className="text-xl text-gray-600">
              Logged in as:{" "}
              <span className="font-semibold text-blue-600">
                {sessionData?.email || "Guest"}
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Role: {isAdmin ? "Administrator" : "User"}
            </p>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg
              className="w-7 h-7 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            What is UfiDesk?
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            UfiDesk is your comprehensive hot desk booking system designed to
            streamline workspace management. Whether you're booking a desk for
            the day or managing office layouts, UfiDesk makes it simple and
            efficient.
          </p>

          {isAdmin ? (
            // Admin-specific description
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border-l-4 border-purple-600">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Administrator Features
                </h3>
                <p className="text-gray-700 mb-4">
                  As an administrator, you have full control over the UfiDesk
                  system:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-xl mt-0.5">
                      •
                    </span>
                    <div>
                      <strong className="text-gray-900">
                        Upload Floorplan:
                      </strong>{" "}
                      Design and upload custom office layouts with various desk
                      types (regular and standing desks), complete with monitor
                      configurations
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-xl mt-0.5">
                      •
                    </span>
                    <div>
                      <strong className="text-gray-900">
                        User Management:
                      </strong>{" "}
                      Create and manage user accounts, assign admin privileges,
                      and control account status
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-xl mt-0.5">
                      •
                    </span>
                    <div>
                      <strong className="text-gray-900">
                        Floorplan Details:
                      </strong>{" "}
                      View desk details and create blocking periods for
                      maintenance, repairs, or special reservations. The system
                      automatically detects conflicts with existing bookings
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-xl mt-0.5">
                      •
                    </span>
                    <div>
                      <strong className="text-gray-900">Desk Booking:</strong>{" "}
                      Full access to book desks for yourself or team members
                      with AM/PM period selection
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            // Regular user description
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-l-4 border-blue-600">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Your Features
                </h3>
                <p className="text-gray-700 mb-4">
                  As a UfiDesk user, you can easily manage your workspace
                  bookings:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl mt-0.5">
                      •
                    </span>
                    <div>
                      <strong className="text-gray-900">Desk Booking:</strong>{" "}
                      Browse the interactive floorplan and book available desks
                      for your preferred dates. Select AM or PM periods, or book
                      full days
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl mt-0.5">
                      •
                    </span>
                    <div>
                      <strong className="text-gray-900">
                        Visual Floorplan:
                      </strong>{" "}
                      See desk availability at a glance with color-coded status
                      indicators and desk features (monitors, desk type)
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl mt-0.5">
                      •
                    </span>
                    <div>
                      <strong className="text-gray-900">Calendar View:</strong>{" "}
                      View your bookings in an intuitive calendar interface.
                      Right-click on your bookings to delete them
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl mt-0.5">
                      •
                    </span>
                    <div>
                      <strong className="text-gray-900">
                        Real-time Notifications:
                      </strong>{" "}
                      Get instant alerts when your bookings are affected by desk
                      blocking or maintenance
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Prompt */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Get Started
          </h2>
          <p className="text-white/90 text-lg mb-6">
            Use the navigation bar at the top to explore UfiDesk's features.
            Click on any of the menu items to get started!
          </p>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isAdmin && (
              <>
                <button
                  onClick={() => navigate("/admin/upload-floorplan")}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-all border border-white/30"
                >
                  <h3 className="font-semibold text-lg mb-1">
                    📐 Upload Floorplan
                  </h3>
                  <p className="text-white/80 text-sm">
                    Create and design office layouts
                  </p>
                </button>
                <button
                  onClick={() => navigate("/admin/user-management")}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-all border border-white/30"
                >
                  <h3 className="font-semibold text-lg mb-1">
                    👥 User Management
                  </h3>
                  <p className="text-white/80 text-sm">
                    Manage user accounts and permissions
                  </p>
                </button>
                <button
                  onClick={() => navigate("/admin/floorplan-details")}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-all border border-white/30"
                >
                  <h3 className="font-semibold text-lg mb-1">
                    🔧 Floorplan Details
                  </h3>
                  <p className="text-white/80 text-sm">
                    View desk details and manage blocking
                  </p>
                </button>
              </>
            )}
            <button
              onClick={() => navigate("/user/desk-booking")}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-all border border-white/30"
            >
              <h3 className="font-semibold text-lg mb-1">📅 Desk Booking</h3>
              <p className="text-white/80 text-sm">
                Reserve your workspace today
              </p>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            Need help? Click on your profile icon in the navbar to update your
            settings or logout.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
