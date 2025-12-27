import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Constant } from "./constant";
import { cookieStore } from "./cookie";
import { editOrganizationReq, editServicePlanReq, editUserReq, organizationFormType, serviceFormType, TerritoryFormRequestValues, TerritoryFormValues, TerritoryMasterApiType, UserFormType } from "./types";
import { DateRangeType, DateValueType } from "react-tailwindcss-datepicker";
import { setServiceDown } from "./systemStatus";

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
      try {
        const status = error?.status;

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
        if (status === 503) {
          setServiceDown(true);
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
      } catch (e) {
        // console.log(e);

      }
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
export async function SaveTerritory(values: TerritoryFormRequestValues) {
  try {
    const response: any = await api.post(
      "/api/admin/territories/save", values
    );
    if (response?.data?.success === true) {
      return response.data?.data;
    }

  } catch (response: any) {
    throw response

  }
}
export async function SaveServicePlan(values: serviceFormType) {
  try {
    const response: any = await api.post(
      "/api/service-plans/save", values
    );
    if (response?.data?.success === true) {
      return response.data?.data;
    }

  } catch (response: any) {
    throw response

  }
}
export async function SaveOrganizations(values: FormData) {
  try {
    const response: any = await api.post(
      "/api/organizations/save", values
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
export async function DeleteTerritory(id: string) {
  try {
    const response = await api.delete(`/api/admin/territories/delete/${id}`);

    if (response.data?.success === true) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Delete territory failed", error);
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
export async function EditTerritory(editFormValue: { id: string, info: TerritoryFormRequestValues }) {

  try {
    const response: any = await api.post(
      `api/admin/territories/update`, { ...editFormValue.info, id: editFormValue.id }
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
      `/api/service-plans/update`, editFormValue.info
    );
    if (response?.data?.success === true) {
      return response.data?.data;
    }

  } catch (response: any) {

    throw response

  }
}
export async function EditOrganization(editFormValue: FormData) {

  try {
    const response: any = await api.post(
      `/api/organizations/update`, editFormValue
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
export async function fetchTerritoryById(id: string) {

  const response: any = await api.get(
    `/api/admin/territories/view/${id}`,
  );
  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error(response.data?.message || "Failed to fetch territory info");
}
export async function fetchStoreCrispList() {

  const response: any = await api.get(
    `/api/utility/stores`,
  );
  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error(response.data?.message || "Failed to fetch store list");
}
export async function fetchUnassignedStoreList() {

  const response: any = await api.get(
    `/api/utility/unassigned-stores`,
  );
  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error(response.data?.message || "Failed to fetch unassigned store list");
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
export async function fetchTerritoryMasterList({
  page,
  search, status,
  per_page
}: {
  per_page: number;
  page: number;
  search: string;
  status?: string | number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    search,
    per_page: String(per_page)
  });
  if (status !== "") params.append("status", String(status));

  const response = await api.get(`/api/admin/territories/list?${params.toString()}`);

  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error("Failed to fetch territory list");
}
// lib/api.ts
export async function fetchCitiesByStates(stateIds: number[]) {
  const res = await api.post(
    "/api/utility/cities/by-states",
    {
      state_ids: stateIds,
    }
  );
  if (res?.data?.success === true) {
    return res.data.data;
  }
  throw new Error("Failed to fetch territory list");
}

export async function fetchServicePlanList({
  page,
  search,
  vehicle_category,
  plan_name,
  category_name,
  status,
  per_page
}: {
  per_page: number;
  page: number;
  search: string;
  vehicle_category?: string | number;
  plan_name?: string | number;
  category_name?: string | number;
  status?: string | number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    search,
    per_page: String(per_page)
  });
  if (plan_name) params.append("plan_name", String(plan_name));
  if (vehicle_category) params.append("vehicle_category", String(vehicle_category));

  if (category_name) params.append("category_name", String(category_name));
  if (status !== "") params.append("status", String(status));

  const response = await api.get(`/api/service-plans?${params.toString()}`);

  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error("Failed to fetch service plan list");
}

export async function fetchServiceLogList({
  page,
  search,
  browser,
  platform,
  device_type,
  per_page,
  action,
  from_date,
  to_date
}: {
  per_page: number;
  page: number;
  search: string;
  browser?: string | number;
  platform?: string | number;
  device_type?: string | number;
  action?: string | number;
  from_date?: string;
  to_date?: string;
}) {
  const params = new URLSearchParams({
    page: String(page),
    search,
    per_page: String(per_page)
  });
  if (platform) params.append("platform", String(platform));
  if (browser) params.append("browser", String(browser));
  if (action) params.append("action", String(action));
  if (browser) params.append("browser", String(browser));
  if (from_date) params.append("from_date", String(from_date));
  if (to_date) params.append("to_date", String(to_date));

  const response = await api.get(`/api/admin/system-logs?${params.toString()}`);

  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error("Failed to fetch system logs list");
}
export async function fetchServiceLogItem(id: string) {
  const response = await api.get(`/api/admin/system-logs/${id.toString()}`);

  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error("Failed to fetch system logs info");
}
export async function fetchStoresList({
  page,
  search,
  status,
  per_page
}: {
  per_page: number;
  page: number;
  search: string;
  status?: string | number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    search,
    per_page: String(per_page)
  });
  if (status !== "") params.append("status", String(status));

  const response = await api.get(`/api/store?${params.toString()}`);

  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error("Failed to fetch organization list");
}
export async function fetchOrganizationsList({
  page,
  search,
  status,
  per_page
}: {
  per_page: number;
  page: number;
  search: string;
  status?: string | number;
}) {
  const params = new URLSearchParams({
    page: String(page),
    search,
    per_page: String(per_page)
  });
  if (status !== "") params.append("status", String(status));

  const response = await api.get(`/api/organizations?${params.toString()}`);

  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error("Failed to fetch organization list");
}
export async function fetchServicePlanMetaInfo() {

  const response = await api.get(`/api/service-plans/meta`);

  if (response?.data?.success === true) {
    return response.data.data;
  }
  throw new Error("Failed to fetch service plan meta info");
}
export async function fetchCountryList() {

  const response = await api.get(`/api/utility/countries`);

  if (response?.data?.success === true) {
    return response.data.data;
  }
  throw new Error("Failed to fetch country info");
}
export async function fetchCityList(state_id: number) {

  const response = await api.get(`/api/utility/cities?state_id=${state_id}`);

  if (response?.data?.success === true) {
    return response.data.data;
  }
  throw new Error("Failed to fetch country info");
}
export async function fetchStateList(country_id: number) {

  const response = await api.get(`/api/utility/states?country_id=${country_id}`);

  if (response?.data?.success === true) {
    return response.data.data;
  }
  throw new Error("Failed to fetch country info");
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
      `/api/service-plans/status/${statusInfo.id}`, { status: statusInfo.status }
    );
    if (response?.data?.success === true) {
      return response.data?.data;
    }

  } catch (response: any) {
    throw response

  }
}
export async function UpdateOrganizationStatus(statusInfo: { id: number, }) {

  try {
    const response: any = await api.post(
      `/api/organizations/status/${statusInfo.id}`,
    );
    if (response?.data?.success === true) {
      return response.data?.data;
    }

  } catch (response: any) {
    throw response

  }
}
export async function UpdateStoreStatus(statusInfo: { id: number, status: number }) {

  try {
    const response: any = await api.post(
      `/api/store/status/${statusInfo.id}`, { status: statusInfo.status }
    );
    if (response?.data?.success === true) {
      return response.data?.data;
    }

  } catch (response: any) {
    throw response

  }
}
export async function UpdateTerritoryStatus(statusInfo: { id: number, }) {

  try {
    const response: any = await api.post(
      `api/admin/territories/status/${statusInfo.id}`
    );
    if (response?.data?.success === true) {
      return response.data?.data;
    }

  } catch (response: any) {
    throw response

  }
}