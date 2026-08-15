import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // GET CURRENT USER
  // ============================================================

  const fetchCurrentUser = async (token) => {
    const response = await fetch(`${API_URL}/users/me`, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to get current user");
    }

    const data = await response.json();

    setUser(data.user);

    return data.user;
  };

  // ============================================================
  // REFRESH ACCESS TOKEN
  // ============================================================

  const refreshAccessToken = async () => {
    if (localStorage.getItem("hasSession") === "false") {
      setAccessToken(null);
      setUser(null);
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      // Handle 401 or non-OK status
      if (response.status === 401 || !response.ok) {
        localStorage.setItem("hasSession", "false");
        setAccessToken(null);
        setUser(null);

        return null;
      }

      const data = await response.json();

      // If backend returned 200 but no token (guest user)
      if (!data.accessToken) {
        localStorage.setItem("hasSession", "false");
        setAccessToken(null);
        setUser(null);

        return null;
      }

      localStorage.setItem("hasSession", "true");
      setAccessToken(data.accessToken);

      // Get the latest user information.
      await fetchCurrentUser(data.accessToken);

      return data.accessToken;
    } catch (error) {
      // Network/server error only.
      console.error("Refresh access token error:", error);

      localStorage.setItem("hasSession", "false");
      setAccessToken(null);
      setUser(null);

      return null;
    }
  };

  // ============================================================
  // LOGIN
  // ============================================================

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Backend sends the access token in the response.
    localStorage.setItem("hasSession", "true");
    setAccessToken(data.accessToken);

    // Backend also sends basic user information.
    setUser(data.user);

    return data;
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Remove authentication information from React state
      // even if the backend request fails.
      localStorage.setItem("hasSession", "false");
      setAccessToken(null);
      setUser(null);
    }
  };

  // ============================================================
  // INITIAL AUTHENTICATION CHECK
  // ============================================================

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        await refreshAccessToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // ============================================================
  // UPDATE USER IN CONTEXT (after profile edit)
  // ============================================================

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  // ============================================================
  // DELETE ACCOUNT
  // ============================================================

  const deleteUserAccount = async () => {
    try {
      const response = await fetch(`${API_URL}/users/account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete account");
      }

      localStorage.setItem("hasSession", "false");
      setAccessToken(null);
      setUser(null);
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    }
  };

  // ============================================================
  // AUTH FETCH (Automatic 401 token refresh retry)
  // ============================================================

  const authFetch = async (url, options = {}) => {
    let currentToken = accessToken;

    if (!currentToken && localStorage.getItem("hasSession") !== "false") {
      currentToken = await refreshAccessToken();
    }

    const headers = {
      ...options.headers,
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
    };

    let response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (
      (response.status === 401 || response.status === 403) &&
      localStorage.getItem("hasSession") !== "false"
    ) {
      const freshToken = await refreshAccessToken();
      if (freshToken) {
        const retryHeaders = {
          ...options.headers,
          Authorization: `Bearer ${freshToken}`,
        };
        response = await fetch(url, {
          ...options,
          headers: retryHeaders,
          credentials: "include",
        });
      }
    }

    return response;
  };

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const value = {
    user,
    accessToken,
    loading,

    login,
    logout,
    refreshAccessToken,
    authFetch,
    updateUser,
    deleteUserAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================
// USE AUTH HOOK
// ============================================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
