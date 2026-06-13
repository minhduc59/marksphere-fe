"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";

type AuthMode = "login" | "register";

type AuthModalContextValue = {
  openAuth: (mode: AuthMode) => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

/** Opens the landing-page login/sign-up modal. Must be used within AuthModalProvider. */
export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return ctx;
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AuthMode | null>(null);

  const openAuth = useCallback((next: AuthMode) => setMode(next), []);
  const close = useCallback(() => setMode(null), []);

  return (
    <AuthModalContext.Provider value={{ openAuth }}>
      {children}
      <Dialog open={mode !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-w-md p-0">
          <DialogTitle className="sr-only">
            {mode === "register" ? "Create account" : "Sign in"}
          </DialogTitle>
          {mode === "login" && (
            <LoginForm
              onSuccess={close}
              onSwitchToRegister={() => setMode("register")}
            />
          )}
          {mode === "register" && (
            <RegisterForm
              onSuccess={close}
              onSwitchToLogin={() => setMode("login")}
            />
          )}
        </DialogContent>
      </Dialog>
    </AuthModalContext.Provider>
  );
}
