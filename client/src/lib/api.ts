import axios, { AxiosResponse } from "axios";
import { Constant } from "./constant";
import { cookieStore } from "./cookie";

export const baseUrl =
  process.env.REACT_APP_BASE_URL || Constant.REACT_APP_BASE_URL;

 
const api = axios.create({
  baseURL:baseUrl,
  // withCredentials: true,   // send & receive cookies
});

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
   const resp = await api.post("/api/login", { email, password });
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
  await fetch(`${baseUrl}/api/logout`, {
    method: 'POST',
  });
}

export async function fetchUserApi() {
  const response :any= await api.get(
    "/api/me",
  );
  console.log(response,'response');
  if(response?.data?.success===true){
  return response.data?.data;
  }
  throw new Error(response.data?.message || "Failed to fetch user");
}



