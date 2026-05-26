/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Sets a browser cookie with a specified expiration time (in days).
 */
export function setCookie(name: string, value: string, days = 30): void {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
}

/**
 * Retrieves the value of a browser cookie by name. Returns empty string if not found.
 */
export function getCookie(name: string): string {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return "";
}

/**
 * Erases a browser cookie by name.
 */
export function eraseCookie(name: string): void {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
}
