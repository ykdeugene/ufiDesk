import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router";
import { toast } from "react-toastify";
import { useSessionStatus, useLogout, useUpdateProfile } from "~/api/hooks";
import {
  useNotificationStore,
  type Notification,
} from "~/stores/notificationStore";
import { useMarkAsNotified } from "~/api/hooks/useNotification";

interface NavItem {
  label: string;
  path: string;
}

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { data: sessionData } = useSessionStatus();
  const {
    register,
    handleSubmit: handleFormSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<{
    email: string;
    password: string;
    confirmPassword: string;
  }>();
  const logout = useLogout();
  const updateProfile = useUpdateProfile();
  const notifications = useNotificationStore((state) => state.notifications);
  const { markAsNotified } = useMarkAsNotified();

  const navItems: NavItem[] = [
    { label: "Upload Floorplan", path: "/admin/upload-floorplan" },
    { label: "User Management", path: "/admin/user-management" },
    { label: "Floorplan Details", path: "/admin/floorplan-details" },
    { label: "Desk Booking", path: "/user/desk-booking" },
  ];

  // Sort nav items alphabetically
  const sortedNavItems = [...navItems].sort((a, b) =>
    a.label.localeCompare(b.label),
  );

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

  const handleAcknowledgeNotification = async (notificationId: string) => {
    try {
      await markAsNotified(notificationId);
      setSelectedNotification(null);
    } catch (error) {
      console.error("Failed to acknowledge notification:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsNotificationOpen(false);
  };

  const handleOpenProfile = () => {
    reset({
      email: sessionData?.email || "",
      password: "",
      confirmPassword: "",
    });
    setIsProfileModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleUpdateProfile = handleFormSubmit((data) => {
    if (data.password && data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    updateProfile.mutate(
      {
        email: data.email,
        password: data.password || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully");
          setIsProfileModalOpen(false);
        },
        onError: (error) => {
          toast.error(`Failed to update profile: ${error.message}`);
        },
      },
    );
  });

  const unreadCount = notifications.filter(
    (notif) => !notif.notifiedStatus,
  ).length;

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
                className={`text-black px-4 py-2 font-medium transition-all border-b-2 ${
                  location.pathname === item.path
                    ? "border-black"
                    : "border-transparent hover:border-gray-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side - Notifications & User Dropdown */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 text-black hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-black">
                      Notifications
                    </h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      No notifications
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notification.notifiedStatus ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <p className="text-sm text-black">
                                Booking{" "}
                                <span className="font-medium">
                                  {notification.booking.id}
                                </span>{" "}
                                was cancelled by{" "}
                                <span className="font-medium">
                                  {notification.cancelledBy}
                                </span>
                              </p>
                              <p className="text-xs text-black mt-1">
                                {new Date(
                                  notification.createdAt,
                                ).toLocaleString()}
                              </p>
                            </div>
                            {!notification.notifiedStatus && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Username with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
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
                  {/* My Profile Button */}
                  <button
                    onClick={handleOpenProfile}
                    className="w-full px-4 py-3 text-left text-sm text-black hover:bg-gray-50 transition-colors"
                  >
                    My Profile
                  </button>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-1" />

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-black hover:bg-gray-50 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-black mb-4">
              Notification Details
            </h3>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Booking ID
                </label>
                <p className="text-gray-800 mt-1">
                  {selectedNotification.booking.id}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Desk ID
                </label>
                <p className="text-gray-800 mt-1">
                  {selectedNotification.booking.deskId}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Booked By
                </label>
                <p className="text-gray-800 mt-1">
                  {selectedNotification.booking.userEmail}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Start Date
                </label>
                <p className="text-gray-800 mt-1">
                  {new Date(
                    selectedNotification.booking.startDate,
                  ).toLocaleDateString()}{" "}
                  ({selectedNotification.booking.startPeriod})
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  End Date
                </label>
                <p className="text-gray-800 mt-1">
                  {new Date(
                    selectedNotification.booking.endDate,
                  ).toLocaleDateString()}{" "}
                  ({selectedNotification.booking.endPeriod})
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Booking Status
                </label>
                <p className="text-gray-800 mt-1">
                  <span className="inline-block px-2 py-1 rounded text-sm bg-red-100 text-black">
                    {selectedNotification.booking.status}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Cancelled By
                </label>
                <p className="text-gray-800 mt-1">
                  {selectedNotification.cancelledBy}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Notification Date
                </label>
                <p className="text-gray-800 mt-1">
                  {new Date(selectedNotification.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
              {!selectedNotification.notifiedStatus && (
                <button
                  onClick={() =>
                    handleAcknowledgeNotification(selectedNotification.id)
                  }
                  className="px-4 py-2 border border-gray-300 text-black rounded hover:bg-gray-50 transition-colors"
                >
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* My Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">My Profile</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                  placeholder="Enter email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                  placeholder="Enter new password"
                />
              </div>

              {watch("password") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    {...register("confirmPassword")}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                    placeholder="Confirm new password"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
