import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Constant } from "./constant";
import { cookieStore } from "./cookie";
import { editOrganizationReq, editServicePlanReq, editUserReq, organizationFormType, productCountHandler, SaveInvoicePaymentPayload, serviceFormType, storeFormType, TerritoryFormRequestValues, TerritoryFormValues, TerritoryMasterApiType, UserFormType } from "./types";
import { DateRangeType, DateValueType } from "react-tailwindcss-datepicker";
import { setServiceDown } from "./systemStatus";
import { mockNotifications } from "./mockData";

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
          window.dispatchEvent(
            new CustomEvent("auth:forbidden", {
              detail: {
                message: "You are not authorized to access this page",
                from: window.location.pathname + window.location.search,
              },
            })
          );
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

    throw response

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
export async function SaveStore(values: FormData) {
  try {
    const response: any = await api.post(
      "/api/stores/save", values
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
export async function DeleteSystemLog(id: string) {
  try {
    const response = await api.delete(`/api/admin/delete-logs/${id}`);

    if (response.data?.success === true) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Delete system log failed", error);
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
export async function ProductCountHelper(productCountData: productCountHandler) {

  try {
    const response: any = await api.post(
      `/api/product/update-${productCountData.type === "sell" ? "sell" : "stock"}/${productCountData.id}`, productCountData.info
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
export async function EditStore(editFormValue: FormData) {

  try {
    const response: any = await api.post(
      `api/stores/update`, editFormValue
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
export async function fetchStoreById(id: string) {

  const response: any = await api.get(
    `/api/stores/view/${id}`,
  );
  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error(response.data?.message || "Failed to fetch store info");
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
export async function getPaymentsList({
  apiLink, param
}: {
  apiLink: string
  param: {
    per_page: number;
    page: number;
    search: string;
    payment_mode?: string;
    from_date?: string
    to_date?: string
    status?: string | number;
  }

}) {
  try {
    const params = new URLSearchParams({
      page: String(param.page),
      search: param.search,
      per_page: String(param.per_page)
    });

    if (param.payment_mode) params.append("payment_mode", String(param.payment_mode));
    if (param.status !== "") params.append("status", String(param.status));

    if (param.from_date) params.append("from_date", String(param.from_date));
    if (param.to_date) params.append("to_date", String(param.to_date));

    const response: any = await api.get(
      apiLink ? `${apiLink}?${params.toString()}` : `/api/payments?${params.toString()}`
    );

    if (response?.data?.success === true) {
      return response.data;
    }

    throw new Error(
      response?.data?.message || "Failed to fetch payments list"
    );
  } catch (response: any) {
    throw response;
  }
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
export async function fetchUserLogInfo({
  page,
  per_page,
  id
}: {
  per_page: number;
  page: number;
  id: string
}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(per_page)
  });

  const response = await api.get(`/api/admin/view-user/${id}?${params.toString()}`);

  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error("Failed to fetch user info");
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

  if (typeof status === "boolean") {
    params.append("status", String(status ? 1 : 0));
  }
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
  per_page?: number;
  page?: number;
  search?: string;
  vehicle_category?: string | number;
  plan_name?: string | number;
  category_name?: string | number;
  status?: string | number;
}) {
  const params = new URLSearchParams();
  if (page) params.append("page", String(page));
  if (search) params.append("search", String(search));

  if (per_page) params.append("per_page", String(per_page));

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

  const response = await api.get(`/api/stores?${params.toString()}`);

  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error("Failed to fetch store list");
}
export async function getConsumer({
  page,
  search,
  status,
  per_page
}: {
  per_page?: number;
  page?: number;
  search?: string;
  status?: string | number;
}) {
  try {
    const params = new URLSearchParams();

    if (page !== undefined) params.append("page", String(page));
    if (per_page !== undefined) params.append("per_page", String(per_page));
    if (search) params.append("search", search);
    if (status) params.append("status", String(status));

    const response: any = await api.get(
      `/api/consumers?${params.toString()}`,
    );

    if (response?.data?.success === true) {
      return response.data; // customer object
    }

    return null;
  } catch (error: any) {
    // 404 / not found → treat as new customer
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
export async function getTransferProduct({
  page,
  search,
  status,
  per_page
}: {
  per_page?: number;
  page?: number;
  search?: string;
  status?: string | number;
}) {
  try {
    const params = new URLSearchParams();

    if (page !== undefined) params.append("page", String(page));
    if (per_page !== undefined) params.append("per_page", String(per_page));
    if (search) params.append("search", search);
    if (status) params.append("status", String(status));

    const response: any = await api.get(
      `/api/transfer-product?${params.toString()}`,
    );

    if (response?.data?.success === true) {
      return response.data; // customer object
    }

    return null;
  } catch (error: any) {
    // 404 / not found → treat as new customer
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
export async function getJobCard({
  apiLink,
  param
}: {
  apiLink: String
  param: {
    per_page?: number;
    page?: number;
    search?: string;
    consumer?: string
    status?: string | number;
  }

}) {
  try {
    const params = new URLSearchParams();

    if (param.page !== undefined) params.append("page", String(param.page));
    if (param.per_page !== undefined) params.append("per_page", String(param.per_page));
    if (param.search) params.append("search", param.search);
    if (param.status) params.append("status", String(param.status));
    if (param.consumer) params.append("consumer", String(param.consumer));

    const response: any = await api.get(
      apiLink ? `${apiLink}?${params.toString()}` :
        `/api/job-cards?${params.toString()}`,
    );

    if (response?.data?.success === true) {
      return response.data; // customer object
    }

    return null;
  } catch (error: any) {
    // 404 / not found → treat as new customer
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
export async function fetchOrganizationsList({
  page,
  search,
  status,
  per_page
}: {
  per_page?: number;
  page?: number;
  search?: string;
  status?: string | number;
}) {
  const params = new URLSearchParams();

  if (page !== undefined) params.append("page", String(page));
  if (per_page !== undefined) params.append("per_page", String(per_page));
  if (search) params.append("search", search);
  if (status) params.append("status", String(status));


  const response = await api.get(`/api/organizations?${params.toString()}`);

  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error("Failed to fetch organization list");
}
export async function fetchTerritoryOrganizationList() {

  const response = await api.get(`/api/utility/territories-with-organizations`);

  if (response?.data?.success === true) {
    return response.data;
  }
  throw new Error("Failed to fetch territory and organization list");
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
export async function UpdateProductStatus(statusInfo: { id: number, status: number, type: string }) {

  try {
    const response: any = await api.post(
      `/api/product/${statusInfo.type === "visibility" ? "visibility-" : ""}status/${statusInfo.id}`, { status: statusInfo.status }
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
export async function UpdateStoreStatus(statusInfo: { id: number }) {

  try {
    const response: any = await api.post(
      `/api/stores/status/${statusInfo.id}`
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


export async function fetchNotifications(params?: {
  page?: number;
  per_page?: number;
}) {
  try {
    const response: any = await api.get(
      "/api/notifications",
      { params }
    );

    if (response?.data?.success === true) {
      return response.data?.data ?? [];
    }

    throw new Error(
      response?.data?.message || "Failed to fetch notifications"
    );
  } catch (response: any) {
    throw response;
  }
}


export async function markNotificationRead(id: string) {
  try {
    const response: any = await api.post(
      `/api/notifications/${id}/read`
    );

    if (response?.data?.success === true) {
      return response.data?.data;
    }

    throw new Error(
      response?.data?.message || "Failed to mark notification as read"
    );
  } catch (response: any) {
    throw response;
  }
}

export async function markAllNotificationsRead() {
  try {
    const response: any = await api.post(
      `/api/notifications/read-all`
    );

    if (response?.data?.success === true) {
      return true;
    }

    throw new Error(
      response?.data?.message || "Failed to mark all notifications as read"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function lookupCustomerByPhone(phone: string, store_id?: string) {
  try {
    const params = new URLSearchParams({
      phone: String(phone),
    });

    if (store_id) params.append("store_id", String(store_id));

    const response: any = await api.get(
      `/api/consumers/lookup?${params.toString()}`,
    );

    if (response?.data?.success === true) {
      return response.data.data; // customer object
    }

    return null;
  } catch (error: any) {
    // 404 / not found → treat as new customer
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
export async function jobCardMetaInfo() {
  try {

    const response: any = await api.get(
      `/api/utility/job-card-meta`,
    );

    if (response?.data?.success === true) {
      return response.data.data; // customer object
    }

    return null;
  } catch (error: any) {
    // 404 / not found → treat as new customer
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
export async function jobCardModelInfo(id: string) {
  try {

    const response: any = await api.get(
      `/api/utility/vehicle-companies/${id}/models`,
    );

    if (response?.data?.success === true) {
      return response.data.data; // customer object
    }

    return null;
  } catch (error: any) {
    // 404 / not found → treat as new customer
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
export async function jobFormSubmission(data: any) {
  try {
    const response: any = await api.post(
      `/api/job-cards${data.id ? `/${data.id}` : ''}/${data.id ? 'update' : 'save'}`,
      data
    );

    if (response?.data?.success === true) {
      return response.data.data;
    }

    throw new Error(
      response?.data?.message || "Failed to submit job card"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function consumerSave(data: any) {
  try {
    const response: any = await api.post(
      `/api/consumers/save`,
      data
    );

    if (response?.data?.success === true) {
      return response.data.data; // customer object
    }

    throw new Error(
      response?.data?.message || "Failed to save consumer"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function getServiceOptionByTypeVehicle(data: any) {
  try {
    const response: any = await api.post(
      `/api/utility/services/by-vehicle-and-type`,
      data
    );

    if (response?.data?.success === true) {
      return response.data.data; // customer object
    }

    throw new Error(
      response?.data?.message || "Failed to get service options"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function jobCardCancel(id: any) {
  try {
    const response: any = await api.post(
      `/api/job-cards/${id}/cancel`,
    );

    if (response?.data?.success === true) {
      return response.data.data; // customer object
    }

    throw new Error(
      response?.data?.message || "Failed to cancel job card"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function jobCardSend(info: any) {
  try {
    const response: any = await api.post(
      `/api/job-cards/${info.jobCard.id}/send?type=${info.jobCard.sendType}`,
    );

    if (response?.data?.success === true) {
      return response.data.data; // customer object
    }

    throw new Error(
      response?.data?.message || "Failed to send job card"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function invoiceSend(info: any) {
  try {

    const response: any = await api.post(
      `/api/invoice/${info.invoice.id}/send?type=${info.invoice.sendType}`,
    );
    if (response?.data?.success === true) {
      return response.data.data; // customer object
    }

    throw new Error(
      response?.data?.message || "Failed to send invoice"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function getCustomerView(id: any) {
  try {
    const response: any = await api.get(
      `/api/consumers/${id}/view`,

    );

    if (response?.data?.success === true) {
      return response.data; // customer object
    }

    throw new Error(
      response?.data?.message || "Failed to get customer view"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function consumerUpdate(data: any) {
  try {
    const response: any = await api.post(
      `/api/consumers/${data.id}/update`,
      data
    );

    if (response?.data?.success === true) {
      return response.data.data; // customer object
    }
    throw new Error(
      response?.data?.message || "Failed to update consumer"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function getJobCardItem(data: any) {
  try {
    const response: any = await api.get(
      `/api/job-cards/${data.id}`,
    );

    if (response?.data?.success === true) {
      return response.data.data; // customer object
    }
    throw new Error(
      response?.data?.message || "Failed to get job card info"
    );
  } catch (response: any) {
    throw response;
  }
}
// const response: any = await api.get(
//   `/api/ ${type==='invoice' ? "invoice":"job-cards"}/print-job-card-slip/${id}`,
// );

// if (response?.data?.success === true) {
//   return response.data.html; 
// }
// throw new Error(
//   response?.data?.message || `Failed to get  ${type==='invoice' ? "invoice":"job card"} slip`
// );
export async function getCommonPrintDownload(row: any, type: string) {
  try {

    return "<div class=\"print-section\" hidden=\"\" id=\"print-section\" style=\"margin:0;font-family: sans-serif;display: block;\" bis_skin_checked=\"1\">\r\n  <link href=\"https:\/\/mycrm.detailingdevils.com\/assets\/css\/icons.css\" rel=\"stylesheet\">\r\n<style>\r\nhtml, body, div, span, applet, object, iframe,\r\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\r\na, abbr, acronym, address, big, cite, code,\r\ndel, dfn, em, img, ins, kbd, q, s, samp,\r\nsmall, strike, strong, sub, sup, tt, var,\r\nb, u, i, center,\r\ndl, dt, dd, ol, ul, li,\r\nfieldset, form, label, legend,\r\ntable, caption, tbody, tfoot, thead, tr, th, td,\r\narticle, aside, canvas, details, embed, \r\nfigure, figcaption, footer, header, hgroup, \r\nmenu, nav, output, ruby, section, summary,\r\ntime, mark, audio, video {\r\n  margin: 0;\r\n  padding: 0;\r\n  border: 0;\r\n  vertical-align: baseline;\r\n}\r\n\/* HTML5 display-role reset for older browsers *\/\r\narticle, aside, details, figcaption, figure, \r\nfooter, header, hgroup, menu, nav, section {\r\n  display: block;\r\n}\r\nbody {\r\n  line-height: 1;\r\n}\r\nol, ul {\r\n  list-style: none;\r\n}\r\nblockquote, q {\r\n  quotes: none;\r\n}\r\nblockquote:before, blockquote:after,\r\nq:before, q:after {\r\n  content: '';\r\n  content: none;\r\n}\r\ntable {\r\n  border-collapse: collapse;\r\n  border-spacing: 0;\r\n}\r\n\r\ninput[type=\"checkbox\"]:checked:before {\r\n  content: \"\";\r\n  position: absolute;\r\n  left: 0%;\r\n  top: 0%;\r\n  width: 100%;\r\n  height: 100%;\r\n  background-color: rgba(0, 0, 255, 0.5);\r\n}\r\ninput[type=\"checkbox\"]:checked:after {\r\n  position: absolute;\r\n    left: 0%;\r\n    top: 0%;\r\n    width: 100%;\r\n    height: 100%;\r\n    content: \"\\f046\";\r\n    display: inline-block;\r\n    font: normal normal normal 42px \/ 1 FontAwesome;\r\n    font-size: inherit;\r\n    text-rendering: auto;\r\n    -webkit-font-smoothing: antialiased;\r\n    -moz-osx-font-smoothing: grayscale;\r\n    background: #FFF;\r\n    color: green;\r\n\r\n}\r\n\r\ninput[type=\"checkbox\"]:checked {\r\n  position: relative;\r\n  pointer-events: none;\r\n}\r\n<\/style>\r\n\r\n  <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin: 0px auto; font-family: sans-serif; font-size: 11px; padding: 0px 0px 0px; background: #fff; border:none;\" width=\"800px\">\r\n  <tbody>\r\n    <tr>\r\n      <td style=\"padding: 0px 0px; width: 800px;\">\r\n        <table style=\"width: 800px; border-collapse: collapse;vertical-align: top;\">\r\n          <tbody>\r\n            <tr>\r\n              <td style=\"width: 600px; padding: 10px;\">\r\n                    \r\n                   <img style=\"max-width: 50%; max-height: 300px; margin: auto;\" src=\"https:\/\/mycrm.detailingdevils.com\/public\/organization-files\/1709713857.png\"> \r\n                                 <\/td>\r\n              <td style=\"width: 200px; text-align: center; padding:15px 0 0px;vertical-align: top;\">\r\n                <table style=\"width: 200px; border-collapse: collapse;\">\r\n                  <tbody>\r\n                    <tr>\r\n                      <td style=\"  text-align: left; font-size: 14px;padding-bottom:10px;\">\r\n                        <strong>Serial No: <u style=\"font-weight:700;\">\r\n                        172509\r\n                        <\/u><\/strong>\r\n                      <\/td>\r\n                    <\/tr>\r\n                    <tr>\r\n                      <td style=\"border:1px solid #000;padding:10px; text-align: left; font-size: 14px;\">\r\n                        <strong>Date : <u style=\"font-weight:700;\">13 Jan 2026<\/u><\/strong>\r\n                      <\/td>\r\n                    <\/tr>\r\n                  <\/tbody>\r\n                <\/table>\r\n              <\/td>\r\n            <\/tr>\r\n          <\/tbody>\r\n        <\/table>\r\n        <table style=\"width: 800px; border-collapse: collapse;margin:30px 0px 0px;\">\r\n          <tbody>\r\n            <tr>\r\n            <tr>\r\n              <td style=\"padding: 10px 0 10px 5px;   text-align: left; font-size: 13px;\">\r\n                <strong> Service Location : <u style=\"font-weight:700;\">DD NOIDA<\/u> <\/strong>\r\n              <\/td>\r\n              <td style=\"padding: 10px 0 10px 5px ;   text-align: right; font-size: 13px;\">\r\n                <strong>Store Manager : ______________________<\/strong>\r\n              <\/td>\r\n            <\/tr>\r\n    <\/tr>\r\n  <\/tbody>\r\n<\/table>\r\n<table border=\"1\" style=\"width: 800px; border-collapse: collapse; table-layout: fixed; box-sizing: border-box; margin: 10px 0px 10px;\">\r\n  <tbody>\r\n    <tr>\r\n      <td style=\"width: 800px; padding: 0px;border: 1px solid #000;\" colspan=\"6\">\r\n        <table style=\"width: 800px; border-collapse: collapse; table-layout: fixed; box-sizing: border-box; font-size: 12px;\">\r\n          <tbody>\r\n            <tr>\r\n              <th style=\"padding: 7px;  width: 90px; text-align: left;\">Name : <\/th>\r\n              <td style=\" padding: 7px;\">Detailing Devils&nbsp;Ss<\/td>\r\n            <\/tr>\r\n          <\/tbody>\r\n        <\/table>\r\n      <\/td>\r\n    <\/tr>\r\n    <tr>\r\n      <td style=\"width: 800px; padding: 0px;border: 1px solid #000;\" colspan=\"6\">\r\n        <table style=\"width: 800px; border-collapse: collapse; table-layout: fixed; box-sizing: border-box; font-size: 12px;\">\r\n          <tbody>\r\n            <tr>\r\n              <th style=\"padding: 7px;  width: 90px; text-align: left;\">Full Address :<\/th>\r\n              <td style=\" padding: 7px;\">124r35, Akasahebpet, Andhra Pradesh - 201323<\/td>\r\n            <\/tr>\r\n          <\/tbody>\r\n        <\/table>\r\n      <\/td>\r\n    <\/tr>\r\n    <tr>\r\n      <td style=\"width: 400px; padding: 0px;border: 1px solid #000;\" colspan=\"3\">\r\n        <table style=\"width: 400px; border-collapse: collapse; table-layout: fixed; box-sizing: border-box; font-size: 12px;\">\r\n          <tbody>\r\n            <tr>\r\n              <th style=\"padding: 7px;  width: 90px; text-align: left;\">Contact No :<\/th>\r\n              <td style=\" padding: 7px;\">6647123413<\/td>\r\n            <\/tr>\r\n          <\/tbody>\r\n        <\/table>\r\n      <\/td>\r\n      <td style=\"width: 400px; padding: 0px;border: 1px solid #000;\" colspan=\"3\">\r\n        <table style=\"width: 400px; border-collapse: collapse; table-layout: fixed; box-sizing: border-box; font-size: 12px;\">\r\n          <tbody>\r\n            <tr>\r\n              <th style=\"padding: 7px;  width: 60px; text-align: left;\">Email : <\/th>\r\n              <td style=\" padding: 7px;\">admin@pos.com<\/td>\r\n            <\/tr>\r\n          <\/tbody>\r\n        <\/table>\r\n      <\/td>\r\n    <\/tr>\r\n    <tr>\r\n\t\r\n      <td style=\"width: 266px; padding: 0px;border: 1px solid #000;\" colspan=\"2\">\r\n        <table style=\"width: 266px; border-collapse: collapse; table-layout: fixed; box-sizing: border-box; font-size: 12px;\">\r\n          <tbody>\r\n            <tr>\r\n              <th style=\"padding: 7px;  width: 90px; text-align: left;\">Vehicle Type :<\/th>\r\n              <td style=\" padding: 7px;\">Luxury Mini SUV<\/td>\r\n            <\/tr>\r\n          <\/tbody>\r\n        <\/table>\r\n      <\/td>\r\n      <td style=\"width: 267px; padding: 0px;border: 1px solid #000;\" colspan=\"2\">\r\n        <table style=\"width: 267px; border-collapse: collapse; table-layout: fixed; box-sizing: border-box; font-size: 12px;\">\r\n          <tbody>\r\n            <tr>\r\n              <th style=\"padding: 7px;  width: 60px; text-align: left;\">Make : <\/th>\r\n              <td style=\" padding: 7px;\">HYUNDAI<\/td>\r\n            <\/tr>\r\n          <\/tbody>\r\n        <\/table>\r\n      <\/td>\r\n    <\/tr>\r\n    <tr>\r\n      <td style=\"width: 266px; padding: 0px;border: 1px solid #000;\" colspan=\"2\">\r\n        <table style=\"width: 266px; border-collapse: collapse; table-layout: fixed; box-sizing: border-box; font-size: 12px;\">\r\n          <tbody>\r\n            <tr>\r\n              <th style=\"padding: 7px;  width: 90px; text-align: left;\">Model : <\/th>\r\n              <td style=\" padding: 7px;\">CRETA<\/td>\r\n            <\/tr>\r\n          <\/tbody>\r\n        <\/table>\r\n      <\/td>\r\n      <td style=\"width: 266px; padding: 0px;border: 1px solid #000;\" colspan=\"2\">\r\n        <table style=\"width: 266px; border-collapse: collapse; table-layout: fixed; box-sizing: border-box; font-size: 12px;\">\r\n          <tbody>\r\n            <tr>\r\n              <th style=\"padding: 7px;  width: 90px; text-align: left;\">Color : <\/th>\r\n              <td style=\" padding: 7px;\">Sr<\/td>\r\n            <\/tr>\r\n          <\/tbody>\r\n        <\/table>\r\n      <\/td>\r\n      <td style=\"width: 267px; padding: 0px;border: 1px solid #000;\" colspan=\"2\">\r\n        <table style=\"width: 267px; border-collapse: collapse; table-layout: fixed; box-sizing: border-box; font-size: 12px;\">\r\n          <tbody>\r\n            <tr>\r\n              <th style=\"padding: 7px;  width: 60px; text-align: left;\">Year : <\/th>\r\n              <td style=\" padding: 7px;\">2025<\/td>\r\n            <\/tr>\r\n          <\/tbody>\r\n        <\/table>\r\n      <\/td>\r\n    <\/tr>\r\n    <tr>\r\n      <td style=\"width: 266px; padding: 0px;border: 1px solid #000;\" colspan=\"2\">\r\n        <table style=\"width: 266px; border-collapse: collapse; table-layout: fixed; box-sizing: border-box; font-size: 12px;\">\r\n          <tbody>\r\n            <tr>\r\n              <th style=\"padding: 7px;  width: 90px; text-align: left;\">Regn. No :<\/th>\r\n              <td style=\" padding: 7px;\">WQDQWE12<\/td>  \r\n            <\/tr>\r\n          <\/tbody>\r\n        <\/table>\r\n      <\/td>\r\n      <td style=\"width: 533px; padding: 0px;border: 1px solid #000;\" colspan=\"4\">\r\n        <table style=\"width: 533px; border-collapse: collapse; table-layout: fixed; box-sizing: border-box; font-size: 12px;\">\r\n          <tbody>\r\n            <tr>\r\n              <th style=\"padding: 7px;  width: 90px; text-align: left;\">Chassis No : <\/th>\r\n              <td style=\" padding: 7px;\"><\/td>\r\n            <\/tr>\r\n          <\/tbody>\r\n        <\/table>\r\n      <\/td>\r\n    <\/tr>\r\n  <\/tbody>\r\n<\/table>\r\n<\/td>\r\n<\/tr>\r\n<tr>\r\n  <td class=\"width=800px;\">\r\n   \r\n    \r\n        <table border=\"0\" style=\"width: 800px; font-size: 11px; border-collapse: collapse; vertical-align:top;page-break-after: always;\">\r\n          <tbody>\r\n            <tr>\r\n              <td style=\"width: 300px; padding: 0px;border:none;vertical-align:top;\">\r\n         <h3 style=\"font-weight:800;font-size:18px;margin-bottom:15px;\">\r\n      <span style=\"color:red;font-size:22px;font-weight:900;\">SRS<\/span> REQUIRED :\r\n    <\/h3>\r\n              <table style=\"width:280px; border-collapse: collapse; table-layout: fixed; box-sizing: border-box; font-size: 12px;margin-right:20px;margin-bottom:15px;\">\r\n                  <tbody>\r\n                                          <tr>\r\n                      <td style=\"font-weight: 600;border: 1px solid #000;padding: 10px 15px;\">\r\n                        <input style=\"vertical-align:middle;\" type=\"checkbox\" disabled  \/> 1 (Brand New)\r\n                      <\/td>\r\n                    <\/tr>\r\n                                          <tr>\r\n                      <td style=\"font-weight: 600;border: 1px solid #000;padding: 10px 15px;\">\r\n                        <input style=\"vertical-align:middle;\" type=\"checkbox\" disabled  \/> 2 (Good Condition)\r\n                      <\/td>\r\n                    <\/tr>\r\n                                          <tr>\r\n                      <td style=\"font-weight: 600;border: 1px solid #000;padding: 10px 15px;\">\r\n                        <input style=\"vertical-align:middle;\" type=\"checkbox\" disabled checked \/> 3 (Fair Condition)\r\n                      <\/td>\r\n                    <\/tr>\r\n                                          <tr>\r\n                      <td style=\"font-weight: 600;border: 1px solid #000;padding: 10px 15px;\">\r\n                        <input style=\"vertical-align:middle;\" type=\"checkbox\" disabled  \/> 4 (Poor Condition)\r\n                      <\/td>\r\n                    <\/tr>\r\n                                      <\/tbody>\r\n                <\/table>\r\n                <h3 style=\"font-weight:800;font-size:18px; margin-bottom:15px;\">\r\n                  <span style=\"color:red;font-size:22px;font-weight:900;\">SERVICES<\/span> OPTED : \r\n          <\/h3>\r\n                    <table border=\"1\" style=\"width:280px; border-collapse:collapse; border: 1px solid #000; table-layout: fixed; box-sizing: border-box; font-size: 12px;margin-right:20px;\">\r\n                      <tbody>\r\n                                                <tr>\r\n                          <td style=\"font-size: 15px;font-weight: 600;padding:7px 15px;\">\r\n                            <input style=\"vertical-align:middle;\" type=\"checkbox\" disabled  checked \/> Front Bumper Coating\r\n                          <\/td>\r\n                        <\/tr>\r\n                                                <tr>\r\n                          <td style=\"font-size: 15px;font-weight: 600;padding:7px 15px;\">\r\n                            <input style=\"vertical-align:middle;\" type=\"checkbox\" disabled  checked \/> Front Bumper Coating\r\n                          <\/td>\r\n                        <\/tr>\r\n                                                <tr>\r\n                          <td style=\"font-size: 15px;font-weight: 600;padding:7px 15px;\">\r\n                            <input style=\"vertical-align:middle;\" type=\"checkbox\" disabled  checked \/> Front Right Door Coating\r\n                          <\/td>\r\n                        <\/tr>\r\n                        \r\n                      <\/tbody>\r\n                    <\/table>\r\n              <\/td>\r\n              <td style=\"width: 500px; padding: 0px;border:none;vertical-align: top;\">\r\n                <table border=\"1\" style=\"width:500px; border-collapse:collapse; border: 1px solid #000; table-layout: fixed; box-sizing: border-box; font-size: 12px;margin-top:10px;margin-bottom:20px;\">\r\n                  <tbody>\r\n                    <tr>\r\n                      <td colspan=\"2\" style=\"font-size: 15px;font-weight: 600;padding:10px 15px 3px;text-align:center;\"> Studio Technician<\/td>\r\n                    <\/tr>\r\n                    <tr>\r\n                      <td style=\"font-size: 15px;font-weight: 600;padding:3px 15px 10px;\"> Name : __________________<\/td>\r\n                    <\/tr>\r\n                    <tr>\r\n                      <td style=\"font-size: 15px;font-weight: 600;padding:13px 15px 15px;\"> Time Start  :__________<\/td>\r\n                      <td style=\"font-size: 15px;font-weight: 600;padding:13px 15px 15px;\"> Time Finish :__________<\/td>\r\n                    <\/tr>\r\n                  <\/tbody>\r\n                <\/table>\r\n                <table border=\"1\" style=\"width:500px; border-collapse:collapse; border: 1px solid #000; table-layout: fixed; box-sizing: border-box; font-size: 12px;margin-bottom:20px;\">\r\n                  <tbody>\r\n\r\n                    <tr>\r\n                      <td style=\"width:80px; font-size: 15px;font-weight: 600;padding:15px 10px 3px;\">Warranty<\/td>\r\n\r\n                      <td style=\"width:80px; font-size: 15px;font-weight: 600;padding:15px 10px 3px;\">\r\n                        <input style=\"vertical-align:middle;\" type=\"checkbox\" disabled  \/> 1 Year\r\n                      <\/td>\r\n                      <td style=\"width:120px;font-size: 15px;font-weight: 600;padding:15px 10px 3px;\">\r\n                        <input  style=\"vertical-align:middle;\" type=\"checkbox\" disabled   \/> 3 Years\r\n                      <\/td>\r\n                      <td style=\"width:120px;font-size: 15px;font-weight: 600;padding:15px 10px 3px;\">\r\n                        <input  style=\"vertical-align:middle;\" type=\"checkbox\" disabled   \/> 5 Years\r\n                      <\/td>\r\n                    <\/tr>\r\n\r\n                    <tr>\r\n                         <td style=\" font-size: 15px;font-weight: 600;padding:13px 10px 3px;\">\r\n                        <input style=\"vertical-align:middle;\" type=\"checkbox\" disabled checked  \/> 6 Years\r\n                      <\/td>\r\n                      <td style=\" font-size: 15px;font-weight: 600;padding:13px 10px 3px;\">\r\n                        <input style=\"vertical-align:middle;\" type=\"checkbox\" disabled   \/> 7 Years\r\n                      <\/td>\r\n                      <td style=\"font-size: 15px;font-weight: 600;padding:13px 10px 3px;\">\r\n                        <input  style=\"vertical-align:middle;\" type=\"checkbox\" disabled  \/> No Warranty\r\n                      <\/td>\r\n\r\n                      <td style=\"font-size: 15px;font-weight: 600;padding:13px 10px 3px;\">\r\n                        <input  style=\"vertical-align:middle;\" type=\"checkbox\" disabled \/> _______\r\n                      <\/td>\r\n                    <\/tr>\r\n                    <tr>\r\n                      <td colspan=\"2\" style=\" font-size: 15px;font-weight: 600;padding:35px 0 10px 15px;\">Customer Signature : <\/td>\r\n                      <td colspan=\"3\" style=\" font-size: 15px;font-weight: 600;padding:35px 10px 13px;\"> __________________________<\/td>\r\n                    <\/tr>\r\n                  <\/tbody>\r\n                <\/table>\r\n                <table border=\"1\" style=\"width:500px; border-collapse:collapse; border: 1px solid #000; table-layout: fixed; box-sizing: border-box; font-size: 12px;margin-bottom:20px;\">\r\n                  <tbody>\r\n                    <tr>\r\n                      <td colspan=\"2\" style=\"font-size: 15px;font-weight: 600;padding:15px 0 10px 15px;\">Damage Waiver<\/td>\r\n                    <\/tr>\r\n                    <tr>\r\n                      <td colspan=\"2\" style=\"font-size: 12px;line-height:18px;padding:0px 15px 10px;\">Detailing Devils uses premium quality vehicle care products and highly trained paint technicians. We take pride in delivering world class results with minimal damage to vehicle's finish. We guarantee flawless paint finish, but take no responsibility for burnouts, burn marks or any other paint damage caused during the SRS (Skin Restoration System) process on the following paint conditions : <\/td>\r\n                    <\/tr>\r\n                    <tr>\r\n                      <td style=\"width:50%; font-size: 14px;font-weight: 600;padding:5px 10px 3px;\">\r\n                        <input style=\"vertical-align:middle;\" type=\"checkbox\" disabled  \/> Repainted Vehicle\r\n                      <\/td>\r\n                      <td style=\"width:50%;font-size: 14px;font-weight: 600;padding:5px 10px 3px;\">\r\n                        <input  style=\"vertical-align:middle;\" type=\"checkbox\" disabled  \/> Single Stage Paint\r\n                      <\/td>\r\n                    <\/tr>\r\n                    <tr>\r\n                      <td style=\"font-size: 14px;font-weight: 600;padding:10px 10px 3px;\">\r\n                        <input  style=\"vertical-align:middle;\" type=\"checkbox\" disabled  \/> Paint Thickness Below 2 MIL\r\n                      <\/td>\r\n                      <td style=\"font-size: 14px;font-weight: 600;padding:10px 10px 3px;\">\r\n                        <input  style=\"vertical-align:middle;\" type=\"checkbox\" disabled  \/> Vehicle older than 5 Years\r\n                      <\/td>\r\n                    <\/tr>\r\n                    <tr>\r\n                      <td colspan=\"2\" style=\"font-size: 12px;line-height:18px;font-weight: 500;padding:15px 10px 10px;\">\r\n                        <input  style=\"vertical-align:middle;\" type=\"checkbox\" disabled checked \/> I have have read the disclaimer above and I understand that Detailing Devils is not responsible for any damage caused to my vehicle's paint during the SRS process.\r\n                      <\/td>\r\n                    <\/tr>\r\n                    <tr>\r\n                      <td colspan=\"2\" style=\"font-size: 15px;font-weight: 600;padding:20px 0 20px 10px;\">\r\n            I <u style=\"font-weight:lighter;\">Detailing Devils&nbsp;Ss<\/u> Authorize Detailing Devils to service my vehicle. <\/td>\r\n                    <\/tr>\r\n                  <\/tbody>\r\n                <\/table>\r\n                <p style=\"text-align:right;\">Paint condition diagram & paint depth analysis cont.<\/p>\r\n              <\/td>\r\n            <\/tr>\r\n          <\/tbody>\r\n        <\/table>\r\n\r\n                <table style=\"width: 800px; border-collapse: collapse;vertical-align: top;page-break-after: always\">\r\n          <tbody>\r\n            <tr>\r\n              <td style=\"width: 800px; padding: 10px;\">\r\n                   <img style=\"width:800px; margin: auto;\" src=\"https:\/\/mycrm.detailingdevils.com\/public\/assets\/franchise-docs\/franchise-service-plans-diagram\/suv.webp\"> \r\n              <\/td>\r\n            <\/tr>\r\n          <\/tbody>\r\n        <\/table>\r\n        \r\n\r\n\r\n      \r\n<table style=\"width: 800px; border-collapse: collapse;vertical-align: top;\">\r\n<tbody>\r\n<tr>\r\n<td colspan=\"2\" style=\"font-size: 12px;line-height:18px;padding:0px 15px 10px;\">\r\n<h3 style=\"margin-bottom: 10px;\">Terms and Conditions<\/h3>\r\n<ol style=\"margin-bottom:10px;list-style:decimal-leading-zero;list-style-position:outside;margin-left:20px;line-height:1.2;\">\r\n<li style=\"margin-bottom:7px;\">The services delineated in this job card are hereby agreed upon by both the client and the franchisee. Any supplementary services requested shall incur additional charges. Only the services listed and authorized in this job card are considered authorized services. The parent company, Detailing Devils, will not be liable for or warrant any unauthorized services rendered.<\/li>\r\n<li style=\"margin-bottom:7px;\">The initial condition of the vehicle has been thoroughly inspected and documented in this job card. The client acknowledges these pre-existing conditions by affixing their signature to this document.<\/li>\r\n<li style=\"margin-bottom:7px;\">Full remuneration is required upon completion of the services unless otherwise agreed in writing. Any outstanding balance must be settled prior to the release of the vehicle.<\/li>\r\n<li style=\"margin-bottom:7px;\">The estimated time for service completion is provided as a guideline only. Delays may occur due to unforeseen circumstances, and the client shall be informed promptly.<\/li>\r\n<li style=\"margin-bottom:7px;\">The franchisee shall not be held responsible for any personal items left in the vehicle. Clients are advised to remove all valuables prior to service.<\/li>\r\n<li style=\"margin-bottom:7px;\">While all reasonable care is taken, the franchisee shall not be held liable for any minor damages or issues not noted during the initial inspection. If damage is noticed during the service that was present from the beginning but missed during the initial inspection, the franchisee shall document the damage and notify the client immediately. The franchisee shall not be held responsible for pre-existing damage once documented. Any new damages incurred during the service shall be resolved by the franchisee.<\/li>\r\n<li style=\"margin-bottom:7px;\">This job card alone does not constitute proof of service. Clients must ensure that service details are uploaded to the Detailing Devils portal to be eligible for any warranty claims.<\/li>\r\n<li style=\"margin-bottom:7px;\">In the event that a Detailing Devils studio ceases operations, clients must claim their warranty from the nearest operational Detailing Devils studio.<\/li>\r\n<li style=\"margin-bottom:7px;\">It is the client's responsibility to maintain records of all service transactions and communications related to their vehicle maintenance.<\/li>\r\n<li style=\"margin-bottom:7px;\">Clients must adhere to all guidelines and schedules provided by Detailing Devils to maintain the validity of their warranty. The warranty is subject to certain terms and conditions, including, but not limited to, the type of service availed and adherence to prescribed maintenance routines.<\/li>\r\n<li style=\"margin-bottom:7px;\">If the client is dissatisfied with the service, they must notify the franchisee within 24 hours of service completion. The franchisee shall make every effort to address and rectify the issue.<\/li>\r\n<li style=\"margin-bottom:7px;\">The franchisee adheres to all applicable environmental and safety standards in service operations. Clients are requested to follow any specific instructions provided by the staff.<\/li>\r\n<li style=\"margin-bottom:7px;\">The franchisee shall not be liable for any delay or failure in performing services due to circumstances beyond their control, including, but not limited to, natural disasters, acts of God, or any other unforeseen events.<\/li>\r\n<li style=\"margin-bottom:7px;\">Any disputes arising from the service shall be addressed amicably. If unresolved, they shall be subject to the jurisdiction of the courts in the place of service.<\/li>\r\n<li style=\"margin-bottom:7px;\">By signing this job card, the client agrees to the terms and conditions outlined herein.<\/li>\r\n<li style=\"margin-bottom:7px;\">All client information shall be kept confidential and used solely for service-related purposes. The franchisee agrees to adhere to data privacy regulations and protect client data.<\/li>\r\n<li style=\"margin-bottom:7px;\">The franchisee is committed to providing high-quality services. Any deviation from standard procedures shall be reported to the parent company, and corrective actions shall be taken.<\/li>\r\n<li style=\"margin-bottom:7px;\">The parent company reserves the right to audit and inspect the franchisee\u2019s operations to ensure compliance with company standards and prevent fraudulent activities.<\/li>\r\n<li style=\"margin-bottom:7px;\">Only services listed and authorized in this job card shall be performed. Any unauthorized services or charges shall not be accepted by the client or the parent company.<\/li>\r\n<li style=\"margin-bottom:7px;\">Clients are encouraged to follow up on maintenance services at authorized franchised stores only. The parent company shall not be responsible for services rendered by unauthorized entities.<\/li>\r\n<li style=\"margin-bottom:7px;\">Detailed records of all services performed shall be maintained by the franchisee and shared with the client. Clients can verify service records through the official website.<\/li>\r\n<li style=\"margin-bottom:7px;\">In the event that damage is caused by the franchisee during the service, the franchisee shall take full responsibility and make necessary repairs or compensations to the client's satisfaction. Detailing Devils, as the parent company, shall not be held liable for any damages or disputes arising from services provided by the franchisee.<\/li>\r\n<li style=\"margin-bottom:7px;\">In case of pickup or drop-off performed by the franchisee, any damages that occur during transportation must be covered by the client or their insurance. The franchisee or the parent company shall not be held liable for any such damages.<\/li>\r\n<\/ol>\r\n<p>\r\n<b>Client Approval<br\/><br\/> \r\n\r\nSignature: ________ <br\/><br\/>\r\nDate: _________   <br\/> <br\/> \r\n<\/b><\/p>\r\n\r\n<p>By signing below, the undersigned acknowledges understanding and acceptance of the terms and conditions outlined in this document and recognizes the importance of maintaining accurate and up-to-date records for any warranty claims.\r\n<\/p>\r\n<\/td>\r\n<\/tr>\r\n<\/tbody>\r\n<\/table>\r\n    \r\n     \r\n  <\/td>\r\n<\/tr>\r\n\r\n\r\n<\/tbody>\r\n<\/table>\r\n  \r\n \r\n\r\n\r\n<\/div>"

  } catch (response: any) {
    throw response;
  }
}
export async function getJobCardPrefillData(data: any) {
  try {
    const response: any = await api.get(
      `/api/job-cards/${data.id}/invoice/prefill`,
    );

    if (response?.data?.success === true) {
      return response.data.data; // customer object
    }
    throw new Error(
      response?.data?.message || "Failed to get job card invoice info"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function createInvoice(data: any) {
  try {
    const { url, ...rest } = data;

    const response: any = await api.post(
      `/api/${url}`,
      rest
    );

    if (response?.data?.success === true) {
      return response.data.data;
    }
    throw new Error(
      response?.data?.message || "Failed to create invoice"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function updateInvoice(data: any) {
  try {
    const response: any = await api.post(
      `/api/invoices/${data.id}/update`,
      data
    );

    if (response?.data?.success === true) {
      return response.data.data;
    }
    throw new Error(
      response?.data?.message || "Failed to update invoice"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function getInvoiceInfo(id: any) {
  try {
    const response: any = await api.get(
      `/api/invoices/${id}`,
    );

    if (response?.data?.success === true) {
      return response.data;
    }
    throw new Error(
      response?.data?.message || "Failed to get invoice info"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function cancelInvoice(data: any) {
  try {
    const response: any = await api.post(
      `/api/invoices/${data.id}/cancel`,
    );

    if (response?.data?.success === true) {
      return response.data.data;
    }
    throw new Error(
      response?.data?.message || "Failed to cancel invoice"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function getInvoiceList({
  apiLink,
  param
}: {
  apiLink: string,
  param: {
    per_page?: number;
    page?: number;
    search?: string;
    status?: string
  }

}) {
  const params = new URLSearchParams();

  if (param.page !== undefined) params.append("page", String(param.page));
  if (param.per_page !== undefined) params.append("per_page", String(param.per_page));
  if (param.search) params.append("search", param.search);
  if (param.status) params.append("status", String(param.status));

  try {
    const response: any = await api.get(
      apiLink ? `${apiLink}?${params.toString()}` : `/api/invoices?${params.toString()}`,
    );

    if (response?.data?.success === true) {
      return response.data;
    }
    throw new Error(
      response?.data?.message || "Failed to get invoice list"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function getInvoiceInfoByJobCardPrefill(data: any) {
  try {
    const response: any = await api.get(
      `/api/job-cards/${data.id}/invoice/prefill`,
    );

    if (response?.data?.success === true) {
      return response.data;
    }
    throw new Error(
      response?.data?.message || "Failed to get invoice info"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function getInvoicePayments(invoiceId: number | string) {
  try {
    const response: any = await api.get(
      `/api/invoices/${invoiceId}/payments`
    );

    if (response?.data?.success === true) {
      return response.data;
    }

    throw new Error(
      response?.data?.message || "Failed to fetch invoice payments"
    );
  } catch (response: any) {
    throw response;
  }
}
export async function saveInvoicePayment(
  invoiceId: number | string,
  payload: SaveInvoicePaymentPayload
) {
  try {
    const response: any = await api.post(
      `/api/invoices/${invoiceId}/save/payments`,
      payload
    );

    if (response?.data?.success === true) {
      return response.data.data;
    }

    throw new Error(
      response?.data?.message || "Failed to save invoice payment"
    );
  } catch (response: any) {
    throw response;
  }
}

export async function cancelPayment(paymentId: number | string) {
  try {
    const response: any = await api.post(
      `/api/payments/${paymentId}/cancel`
    );

    if (response?.data?.success === true) {
      return response.data.data;
    }

    throw new Error(
      response?.data?.message || "Failed to cancel payment"
    );
  } catch (response: any) {
    throw response;
  }
}

export async function getCustomerDashboardView(id: any) {
  try {
    const response: any = await api.get(
      `api/consumers/${id}/dashboard`,

    );

    if (response?.data?.success === true) {
      return response.data; // customer object
    }

    throw new Error(
      response?.data?.message || "Failed to get customer dashboard view"
    );
  } catch (response: any) {
    throw response;
  }
}