import { useSession } from "next-auth/react";
import { useCallback } from "react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface UseAuthenticatedApiReturn {
  apiCall: <T = any>(
    endpoint: string,
    options?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken?: string;
}

export function useAuthenticatedApi(): UseAuthenticatedApiReturn {
  const { data: session, status } = useSession();
  
  const apiCall = useCallback(
    async <T = any>(
      endpoint: string,
      options: AxiosRequestConfig = {}
    ): Promise<AxiosResponse<T>> => {
      if (!session?.accessToken) {
        throw new Error("No access token available");
      }

      const config: AxiosRequestConfig = {
        ...options,
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
      };

      try {
        return await axios(config);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Si el token ha expirado, podrías manejar la renovación aquí
          if (error.response?.status === 401) {
            console.error("Token expired or invalid");
            // Aquí podrías disparar una acción para renovar el token o redirigir al login
          }
        }
        throw error;
      }
    },
    [session?.accessToken]
  );

  return {
    apiCall,
    isAuthenticated: !!session?.accessToken,
    isLoading: status === "loading",
    accessToken: session?.accessToken,
  };
}

// Hook específico para operaciones CRUD comunes
export function useApiOperations() {
  const { apiCall, isAuthenticated, isLoading } = useAuthenticatedApi();

  const get = useCallback(
    <T = any>(endpoint: string, params?: Record<string, any>) => {
      return apiCall<T>(endpoint, {
        method: "GET",
        params,
      });
    },
    [apiCall]
  );

  const post = useCallback(
    <T = any>(endpoint: string, data?: any) => {
      return apiCall<T>(endpoint, {
        method: "POST",
        data,
      });
    },
    [apiCall]
  );

  const put = useCallback(
    <T = any>(endpoint: string, data?: any) => {
      return apiCall<T>(endpoint, {
        method: "PUT",
        data,
      });
    },
    [apiCall]
  );

  const del = useCallback(
    <T = any>(endpoint: string) => {
      return apiCall<T>(endpoint, {
        method: "DELETE",
      });
    },
    [apiCall]
  );

  return {
    get,
    post,
    put,
    delete: del,
    isAuthenticated,
    isLoading,
  };
}