import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { RoleId } from "@visionesoft/permissions";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roleId: RoleId;
  tenantId: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Restore from sessionStorage on page reload
    const stored = sessionStorage.getItem("vs_user");
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // In production, call the identity service API
      // For Phase 0 / development, use a mock
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (email === "admin@visionesoft.com" && password === "Admin@VisioneSoft1!") {
        const mockUser: AuthUser = {
          id: "usr_owner_001",
          email,
          displayName: "Platform Admin",
          roleId: "owner_admin",
          tenantId: "tenant_platform"
        };
        setUser(mockUser);
        sessionStorage.setItem("vs_user", JSON.stringify(mockUser));
        return { success: true };
      }

      return { success: false, error: "Invalid email or password" };
    } catch {
      return { success: false, error: "Login failed. Please try again." };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("vs_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
