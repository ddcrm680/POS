import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Constant } from "./constant";
import { cookieStore } from "./cookie";

export const baseUrl =
  process.env.REACT_APP_BASE_URL || Constant.REACT_APP_BASE_URL;


function getRawToken() {
  // token may be stored as "Bearer abc..." or "abc..."
  const fromCookie = cookieStore.getItem("token") || null;
  const fromLS = localStorage.getItem("token") || null;
  const raw = fromCookie || fromLS || "";
  // strip existing "Bearer " prefix if present
  return raw.startsWith("Bearer ") ? raw.slice(7) : raw;
}

function createInstance(): AxiosInstance {
  const inst = axios.create({
    baseURL:baseUrl,
    // no withCredentials by default, you can set conditionally if needed
    // withCredentials: true,
  });

  inst.interceptors.request.use((cfg) => {
    const token = getRawToken();
    if (token) {
      cfg.headers = cfg.headers || {};
      cfg.headers["Authorization"] = `Bearer ${token}`;
    }
      try {
    console.debug('[API Request]', cfg.method?.toUpperCase(), cfg.url, 'headers:', {
      ...cfg.headers
    });
  } catch (e) {}

    return cfg;
  });

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
  if(body?.success===true){
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
    console.log("Token being used:", getRawToken());
    
    // Try with exact same headers as working account call
    const response = await api.post("/api/logout", {},);
    
    console.log("Logout success:", response.data);
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
    localStorage.removeItem("userInfo");
    cookieStore.removeItem("token");
  }
}

export async function fetchUserApi() {
  const response :any= await api.get(
    "/api/account",

  );
  console.log(response,'response');
  if(response?.data?.success===true){
  return response.data?.data;
  }
  throw new Error(response.data?.message || "Failed to fetch user");
}
export async function EditProfile(fd:any) {
  try{
    const response :any= await api.post(
    "/api/account/update-profile",fd
  );
  console.log(response,'response');
  if(response?.data?.success===true){
  return response.data?.data;
  }
  }catch(response:any){
     console.log(response.response?.data?.message,'response');
  
  throw new Error(response.response?.data?.message || "Failed to update user details");

  }
 }

export async function UpdatePassword(values:any) {
  try{
    const response :any= await api.post(
    "/api/account/update-password",values
  );
  console.log(response,'response');
  if(response?.data?.success===true){
  return response.data?.data;
  }
  }catch(response:any){
     console.log(response.response?.data?.message,'response');
  
  throw new Error(response.response?.data?.message || "Failed to update user details");

  }
 }

