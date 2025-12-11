import axios from "axios";
import { Constant } from "./constant";

export const baseUrl =
  process.env.REACT_APP_BASE_URL || Constant.REACT_APP_BASE_URL;

 
const api = axios.create({
  baseURL:baseUrl,
  withCredentials: true,   // send & receive cookies
});
 
// Laravel Sanctum uses this cookie name
api.defaults.xsrfCookieName = 'XSRF-TOKEN';
api.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';


export function getXsrfTokenFromCookie() {
  const name = "XSRF-TOKEN=";

  const parts = document.cookie.split(";").map((p) => p.trim());
  const cookie = parts.find((p) => p.startsWith(name));

  if (!cookie) return null;

  return decodeURIComponent(cookie.substring(name.length));
}

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  // 1) Request CSRF cookie
  // await api.get("/sanctum/csrf-cookie");

  // // 2) Get token from cookie
  // const xsrf = getXsrfTokenFromCookie();

  // // 3) Axios POST with XSRF header
  // const response = await api.post(
  //   "/api/login",
  //   { email, password },
  //   {
  //     headers: {
  //       "X-XSRF-TOKEN": xsrf ?? "",
  //     },
  //   }
  // );
  localStorage.setItem("userInfo",JSON.stringify({ email, password }));
  const response={data:{ email,
  password,}};
  return response.data;
}

export async function logout() {
  // await fetch(`${baseUrl}/api/logout`, {
  //   method: 'POST',
  //   credentials: 'include',
  //   headers: { 'Content-Type': 'application/json' },
  // });
  localStorage.removeItem("userInfo");
}

export async function fetchUserApi() {
  //  const res = await  fetch(`${baseUrl}/api/user`, {
  //   method: 'GET',
  //   credentials: 'include',
  //   headers: { 'Content-Type': 'application/json' },
  // });
  
 const user= localStorage.getItem("userInfo");
  // if (res.status === 401 || res.status === 204) return null;
  return user ? JSON.parse(user) : null;
}

export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  data?: any
) {
  const xsrf = getXsrfTokenFromCookie();

  const response = await api.request({
    method,
    url,
    data,
    headers: xsrf
      ? {
          "X-XSRF-TOKEN": xsrf,
        }
      : {},
  });

  return response.data;
}