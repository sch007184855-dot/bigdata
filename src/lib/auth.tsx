import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "ttareungi_admin_auth";
const ADMIN_ID = "admin";
const ADMIN_PW = "admin1234";

type AuthContextValue = {
  isAdmin: boolean;
  login: (id: string, pw: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsAdmin(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const login: AuthContextValue["login"] = (id, pw) => {
    if (id === ADMIN_ID && pw === ADMIN_PW) {
      window.localStorage.setItem(STORAGE_KEY, "1");
      setIsAdmin(true);
      return { ok: true };
    }
    return { ok: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setIsAdmin(false);
  };

  return <AuthContext.Provider value={{ isAdmin, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
