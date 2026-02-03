import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useLogin, useSessionStatus } from "~/api/hooks";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "~/api/hooks/useAuth";

interface LoginFormData {
  email: string;
  password: string;
}

export function Login() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      console.log("🔐 Login successful!");
      console.log("📧 Email:", result.email);
      console.log("👤 Role:", result.role);
      console.log("🔑 Is Admin:", result.admin);
      console.log("📦 Full login response:", result);

      toast.success(`Welcome, ${result.email}!`);

      // Directly set the session data in the cache with admin field
      queryClient.setQueryData(authKeys.session(), {
        email: result.email,
        role: result.role,
        admin: result.admin,
        message: result.message,
      });
      console.log("✅ Session data set in cache");

      // Navigate based on admin boolean
      if (result.admin === true) {
        console.log("➡️ Navigating to admin page");
        navigate("/admin/user-management");
      } else {
        console.log("➡️ Navigating to desk booking");
        navigate("/user/desk-booking");
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
      toast.error(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-center text-4xl font-bold mb-8 text-gray-800">
          UfiDesk
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm text-gray-600">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className="px-3 py-3 text-base text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm text-gray-600">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password", { required: "Password is required" })}
              className="px-3 py-3 text-base text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="text-red-500 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="px-3 py-3 text-base bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer mt-2.5 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
