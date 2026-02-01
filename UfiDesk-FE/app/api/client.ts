import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

// API Client configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseUrl: string) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Important for session cookies
    });
  }

  async request<T>(
    endpoint: string,
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request<ApiResponse<T>>({
        url: endpoint,
        ...config,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Server responded with error
        return (
          error.response.data || {
            success: false,
            message: error.message || "An error occurred",
            data: null,
          }
        );
      }

      // Network or other error
      return {
        success: false,
        message: error instanceof Error ? error.message : "Network error",
        data: null,
      };
    }
  }

  get<T>(endpoint: string, config?: AxiosRequestConfig) {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  post<T>(endpoint: string, body?: unknown, config?: AxiosRequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      data: body,
    });
  }

  put<T>(endpoint: string, body?: unknown, config?: AxiosRequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      data: body,
    });
  }

  delete<T>(endpoint: string, config?: AxiosRequestConfig) {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
