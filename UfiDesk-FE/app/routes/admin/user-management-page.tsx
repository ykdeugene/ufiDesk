import { useState, useEffect } from "react";
import { useGetUsers, useCreateUser, useUpdateUser } from "~/api/hooks";
import { toast } from "react-toastify";

interface User {
  email: string;
  admin: boolean;
  active: boolean;
}

export function UserManagementPage() {
  const { data: users = [], isLoading, error } = useGetUsers();

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    admin: false,
    active: false,
  });

  const openCreateModal = () => {
    setIsCreateMode(true);
    setSelectedUser(null);
    setFormData({ email: "", password: "", admin: false, active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setIsCreateMode(false);
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "",
      admin: user.admin,
      active: user.active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsCreateMode(false);
    setSelectedUser(null);
    setFormData({ email: "", password: "", admin: false, active: false });
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isCreateMode) {
        // Create new user
        await createUserMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
          admin: formData.admin,
          active: formData.active,
        });
        toast.success(`User ${formData.email} created successfully`);
      } else if (selectedUser) {
        // Update existing user
        await updateUserMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
          admin: formData.admin,
          active: formData.active,
        });
        toast.success(`User ${formData.email} updated successfully`);
      }
      closeModal();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load users</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <button
            onClick={openCreateModal}
            className="text-gray-700 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            Create User
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={user.email + index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.admin
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.admin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-gray-700 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer"
                    >
                      Update Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300 ease-out">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all duration-300 ease-out scale-100 opacity-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {isCreateMode ? "Create New User" : "Update User Details"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password {!isCreateMode && "(leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder={
                    isCreateMode ? "Enter password" : "Enter new password"
                  }
                  required={isCreateMode}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="admin"
                  checked={formData.admin}
                  onChange={(e) =>
                    setFormData({ ...formData, admin: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="admin"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Admin Role
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="active"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Account Active
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={
                    createUserMutation.isPending || updateUserMutation.isPending
                  }
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {createUserMutation.isPending || updateUserMutation.isPending
                    ? "Processing..."
                    : isCreateMode
                      ? "Create User"
                      : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={
                    createUserMutation.isPending || updateUserMutation.isPending
                  }
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagementPage;
