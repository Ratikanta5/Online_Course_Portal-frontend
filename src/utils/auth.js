export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const removeUser = () => {
  localStorage.removeItem("user");
};

// Token management
export const setToken = (token) => {
  if (token) {
    localStorage.setItem("authToken", token);
  }
};

export const getToken = () => {
  return localStorage.getItem("authToken") || null;
};

export const removeToken = () => {
  localStorage.removeItem("authToken");
};
