import { getAuth } from 'firebase/auth';

/**
 * Returns a key scoped by the currently logged-in user's UID.
 * If no user is logged in, it uses a 'guest' prefix to prevent cross-user leakage.
 */
export function getScopedKey(key: string): string {
  let userId: string | undefined;
  try {
    const auth = getAuth();
    userId = auth.currentUser?.uid;
  } catch (e) {
    // Firebase app might not be initialized yet during early load
  }
  return userId ? `user_${userId}_${key}` : `guest_${key}`;
}

export const scopedStorage = {
  getItem(key: string): string | null {
    return localStorage.getItem(getScopedKey(key));
  },
  
  setItem(key: string, value: string): void {
    localStorage.setItem(getScopedKey(key), value);
  },
  
  removeItem(key: string): void {
    localStorage.removeItem(getScopedKey(key));
  },

  // Clear all guest data from local storage
  clearGuestData(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('guest_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  },

  // Clear all data for a specific user from local storage
  clearUserData(userId: string): void {
    const prefix = `user_${userId}_`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
};
