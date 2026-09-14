import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("atlasmiles_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .getProfile()
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("atlasmiles_token");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password, loginAs) {
    const data = await api.login({ email, password, loginAs });
    localStorage.setItem("atlasmiles_token", data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await api.register(payload);
    localStorage.setItem("atlasmiles_token", data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("atlasmiles_token");
    setUser(null);
  }

  function updateUserInState(updatedUser) {
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserInState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
