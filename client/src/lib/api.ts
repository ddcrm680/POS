import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Constant } from "./constant";
import { cookieStore } from "./cookie";
import { editServicePlanReq, editUserReq, UserFormType } from "./types";

export const baseUrl =
  process.env.REACT_APP_BASE_URL || Constant.REACT_APP_BASE_URL;
const API_TIMEOUT =
  Number(process.env.REACT_APP_API_TIMEOUT) || Constant.REACT_APP_API_TIMEOUT;
const API_RETRY_COUNT = Number(process.env.REACT_APP_API_RETRY_COUNT) || Constant.REACT_APP_API_RETRY_COUNT

export function getRawToken() {
  const fromCookie = cookieStore.getItem("token") || null;
  const fromLS = localStorage.getItem("token") || null;
  const raw = fromCookie || fromLS || "";
  return raw.startsWith("Bearer ") ? raw.slice(7) : raw;
}

function createInstance(): AxiosInstance {
  const inst = axios.create({
    baseURL: baseUrl,
    timeout: API_TIMEOUT,
  });

  // Attach token
  inst.interceptors.request.use((cfg) => {
    const token = getRawToken();
    if (token) {
      cfg.headers = cfg.headers || {};
      cfg.headers["Authorization"] = `Bearer ${token}`;
    }

    // 👇 init retry counter
    (cfg as any).__retryCount = (cfg as any).__retryCount || 0;

    return cfg;
  });

  // 🔁 Retry interceptor
  inst.interceptors.response.use(
    (res) => res,
    async (error) => {
      const status = error?.status;
      console.log(error, 'status');

      if (status === 401) {
        sessionStorage.setItem("sessionExpired", "1");

        // clear auth
        localStorage.clear();
        cookieStore.removeItem("token");

        window.location.href = "/login";

        return Promise.reject(error);
      }
      if (status === 403) {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }

      const cfg = error.config;
      // ❌ No config = can't retry
      if (!cfg) return Promise.reject(error);

      const isTimeout = error.code === "ECONNABORTED";
      const isNetwork = !error.response;

      const shouldRetry = isTimeout || isNetwork;

      if (shouldRetry && cfg.__retryCount < API_RETRY_COUNT) {
        cfg.__retryCount += 1;

        return inst(cfg); // 🔁 retry request
      }

      return Promise.reject(error);
    }
  );

  return inst;
}


export const api = createInstance();

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const resp = await axios.post(`${baseUrl}/api/login`, { email, password });
  const body = resp.data;

  if (!body?.success) {
    throw new Error(body?.message || "Login failed");
  }
  if (body?.success === true) {
    if (body.token) {
      // store 7 days
      cookieStore.setItem("token", body.token, 7, "/");
    }

    localStorage.setItem("userInfo", JSON.stringify(body.data));

    return body?.data;
  }
  throw new Error(body?.message || "Login failed");
}

export async function logout() {
  try {

    // Try with exact same headers as working account call
    const response = await api.post("/api/logout", {},);

    // return response.data;
  } catch (error: any) {
    console.error("Logout failed with details:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message
    });
    throw error;
  } finally {
    localStorage.clear();
    cookieStore.removeItem("token");
  }
}

export async function fetchUserApi() {
  const response: any = await api.get(
    "/api/account",

  );
  if (response?.data?.success === true) {
    return response.data?.data;
  }
  throw new Error(response.data?.message || "Failed to fetch user");
}
export async function EditProfile(fd: any) {
  try {
    const response: any = await api.post(
      "/api/account/update-profile", fd
    );
    if (response?.data?.success === true) {
      return response.data?.data;
    }
  } catch (response: any) {

    throw new Error(response.response?.data?.message || "Failed to update user details");

  }
}

export async function UpdatePassword(values: any) {
  try {
    const response: any = await api.post(
      "/api/account/update-password", values
    );
    if (response?.data?.success === true) {
      return response.data?.data;
    }
  } catch (response: any) {

    throw new Error(response.response?.data?.message || "Failed to update user details");

  }
}

export async function SaveUser(values: UserFormType) {
  try {
    const response: any = await api.post(
      "/api/admin/add-user", values
    );
    if (response?.data?.success === true) {
      return response.data?.data;
    }

  } catch (response: any) {
    throw response

  }
}
export async function SaveServicePlan(values: UserFormType) {
  try {
    const response: any = await api.post(
      "/api/admin/add-user", values
    );
    if (response?.data?.success === true) {
      return response.data?.data;
    }

  } catch (response: any) {
    throw response

  }
}
export async function DeleteUser(id: string) {
  try {
    const response = await api.delete(`/api/admin/delete-user/${id}`);

    if (response.data?.success === true) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Delete user failed", error);
    throw error;
  }
}

export async function EditUser(editFormValue: editUserReq) {

  try {
    const response: any = await api.post(
      `/api/admin/update-user/${editFormValue.id}`, editFormValue.info
    );
    if (response?.data?.success === true) {
      return response.data?.data;
    }

  } catch (response: any) {

    throw response

  }
}
export async function EditServicePlan(editFormValue: editServicePlanReq) {

  try {
    const response: any = await api.post(
      `/api/admin/update-user/${editFormValue.id}`, editFormValue.info
    );
    if (response?.data?.success === true) {
      return response.data?.data;
    }

  } catch (response: any) {

    throw response

  }
}
export async function fetchRoleList() {

  const response: any = await api.get(
    "/api/utility/roles",
  );
  if (response?.data?.success === true) {
    return response.data?.data;
  }
  throw new Error(response.data?.message || "Failed to fetch role list");
}
export async function fetchUserList({
  page,
  search,
  role_id,
  status,
  per_page
}: {
  per_page: number;
  page: number;
  search: string;
  role_id?: string | number;
  status?: string | number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    search,
    per_page: String(per_page)
  });

  if (role_id) params.append("role_id", String(role_id));
  if (status !== "") params.append("status", String(status));

  const response = await api.get(`/api/admin/users?${params.toString()}`);

  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error("Failed to fetch user list");
}
export async function fetchServicePlanList({
  page,
  search,
  vehicle_type,
  plan_name,
  category_type,
  status,
  per_page
}: {
  per_page: number;
  page: number;
  search: string;
  vehicle_type?: string | number;
  plan_name?: string | number;
  category_type?: string | number;
  status?: string | number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    search,
    per_page: String(per_page)
  });
  if (plan_name) params.append("plan_name", String(plan_name));
  if (vehicle_type) params.append("vehicle_type", String(vehicle_type));

  if (category_type) params.append("category_type", String(category_type));
  if (status !== "") params.append("status", String(status));

  const response = await api.get(`/api/admin/users?${params.toString()}`);

  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error("Failed to fetch user list");
}
export async function fetchVehicleList({
  page,
  search,
  per_page
}: {
  per_page: number;
  page: number;
  search: string;
}) {
  const params = new URLSearchParams({
    page: String(page),
    search,
    per_page: String(per_page)
  });

  const response = await api.get(`/api/utility/vehicle-companies?${params.toString()}`);

  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error("Failed to fetch vehicle list");
}
export async function UpdateUserStatus(statusInfo: { id: number, status: number }) {

  try {
    const response: any = await api.post(
      `/api/admin/user/status/${statusInfo.id}`, { status: statusInfo.status }
    );
    if (response?.data?.success === true) {
      return response.data?.data;
    }

  } catch (response: any) {
    throw response

  }
}
export async function UpdateServicePlanStatus(statusInfo: { id: number, status: number }) {

  try {
    const response: any = await api.post(
      `/api/admin/user/status/${statusInfo.id}`, { status: statusInfo.status }
    );
    if (response?.data?.success === true) {
      return response.data?.data;
    }

  } catch (response: any) {
    throw response

  }
}