export class CookieStorage {
  // Set cookie (session cookie, no expiry)
 setItem(
  name: string,
  value: string,
  days?: number,
  path = "/"
) {
  const attrs: string[] = [];

  // if (typeof days === "number") {
  //   const expiry = new Date();
  //   expiry.setTime(expiry.getTime() + days * 24 * 60 * 60 * 1000);
  //   attrs.push(`expires=${expiry.toUTCString()}`);
  // }

  attrs.push(`path=${path}`);
  attrs.push("SameSite=Lax");

  // Only enable Secure if https
  if (window.location.protocol === "https:") {
    attrs.push("Secure");
  }

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}; ${attrs.join("; ")}`;
}


  // Get cookie
  getItem(name: string): string | null {
    const cookies = document.cookie.split("; ");

    for (const cookie of cookies) {
      const [key, val] = cookie.split("=");
      if (key === name) return decodeURIComponent(val);
    }
    return null;
  }

  // Remove one cookie
  removeItem(name: string, path: string = "/") {
    document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  // Check if cookie exists
  hasItem(name: string): boolean {
    return this.getItem(name) !== null;
  }

  // Clear ALL cookies
  clear() {
    const cookies = document.cookie.split("; ");

    for (const cookie of cookies) {
      const name = cookie.split("=")[0];
      this.removeItem(name);
    }
  }
}

// Singleton instance
export const cookieStore = new CookieStorage();
