import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getMe, login as loginApi, logout as logoutApi } from "@/api/auth";
import { ROLE_HOME } from "@/constants/roles";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await getMe();
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, [fetchUser]);

  const login = async (email, password) => {
    const { data } = await loginApi(email, password);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  const getHomePath = (role) => ROLE_HOME[role] || "/login";

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, fetchUser, getHomePath, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
