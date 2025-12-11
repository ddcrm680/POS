import axios from "axios";
import { Constant } from "./constant";

export const baseUrl =
  process.env.REACT_APP_BASE_URL || Constant.REACT_APP_BASE_URL;

 
const api = axios.create({
  baseURL:baseUrl,
  withCredentials: true,   // send & receive cookies
});

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {

  const response = await api.post(
    "/api/login",
    { email, password },
  );
  // localStorage.setItem("userInfo",JSON.stringify({ email, password }));
  // const response={data:{ email,
  // password,}};
  return response.data;
}

export async function logout() {
  await fetch(`${baseUrl}/api/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  // localStorage.removeItem("userInfo");
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

