// utils/auth.js

// Save token
export const setToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  }
};

// Get token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Remove token (logout)
export const removeToken = () => {
  localStorage.removeItem("token");
};

// Check if user is logged in
export const isLoggedIn = () => {
  const token = getToken();
  return !!token;   // returns true if token exists
};

// Get user info from token (optional - decode without verification)
export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    // Simple JWT decode (without verification - for UI only)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};
const auth = {
  setToken,
  getToken,
  removeToken,
  isLoggedIn,
  getUserFromToken,
};

export default auth;