export const setUser = (user) => {
  sessionStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const removeUser = () => {
  sessionStorage.removeItem("user");
};

// Token management
export const setToken = (token) => {
  if (token) {
    sessionStorage.setItem("authToken", token);
  }
};

export const getToken = () => {
  return sessionStorage.getItem("authToken") || null;
};

export const removeToken = () => {
  sessionStorage.removeItem("authToken");
};

// Clear all auth data
export const clearAuth = () => {
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("authToken");
};
