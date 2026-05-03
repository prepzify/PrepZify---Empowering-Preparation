const getBaseUrl = () => {
  try {
    // If we are in production and have a VITE_API_URL, use it
    const env = (import.meta as any).env;
    if (env?.PROD && env?.VITE_API_URL) {
      return env.VITE_API_URL;
    }
  } catch (e) {
    console.error("Error accessing import.meta.env:", e);
  }
  // Otherwise, use relative paths in dev if hosted together, or empty string
  return ""; 
};

export const API_BASE_URL = getBaseUrl();
