import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Initialize dark mode from localStorage or system preference
const initializeDarkMode = () => {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (storedTheme === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    // Check system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }
};

// Global auth state setup
// This ensures that all components can access auth state directly
// without needing to use React Context which can cause circular dependencies
window.appAuth = {
  isAuthenticated: !!localStorage.getItem("token"),
  user: (() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      console.error("Error parsing user data", e);
      return null;
    }
  })(),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.appAuth.isAuthenticated = false;
    window.appAuth.user = null;
    window.location.href = "/login";
  },
  login: (token: string, user: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    window.appAuth.isAuthenticated = true;
    window.appAuth.user = user;
  }
};

// Initialize dark mode
initializeDarkMode();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
