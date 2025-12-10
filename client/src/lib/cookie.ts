export class CookieStorage {
  // Set cookie (session cookie, no expiry)
  setItem(name: string, value: string, path: string = "/") {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=${path}`;
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
