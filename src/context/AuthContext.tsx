"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthContextValue = {
  authenticated: boolean;
  name: string | null;
  phone: string | null;
  loading: boolean;
  login: (user: { name: string; phone: string }) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  authenticated: false,
  name: null,
  phone: null,
  loading: true,
  login: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => res.json())
      .then((data) => {
        setAuthenticated(Boolean(data?.authenticated));
        setName(data?.name ?? null);
        setPhone(data?.phone ?? null);
      })
      .catch(() => {
        setAuthenticated(false);
        setName(null);
        setPhone(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = ({ name, phone }: { name: string; phone: string }) => {
    setAuthenticated(true);
    setName(name);
    setPhone(phone);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
    setName(null);
    setPhone(null);
  };

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        name,
        phone,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
