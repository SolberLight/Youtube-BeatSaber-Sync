import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ThemeDefinition } from "./theme-types";
import { themes, themeMap, midnightEmber } from "./index";

interface ThemeContextValue {
  currentTheme: ThemeDefinition;
  setTheme: (id: string) => void;
  themes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextValue>({
  currentTheme: midnightEmber,
  setTheme: () => {},
  themes,
});

const STORAGE_KEY = "ytbssync-theme";

let styleElement: HTMLStyleElement | null = null;

function applyTheme(theme: ThemeDefinition) {
  const root = document.documentElement;

  // Set data attribute for CSS scoping
  root.setAttribute("data-theme", theme.id);

  // Apply CSS variables
  for (const [key, value] of Object.entries(theme.cssVariables)) {
    root.style.setProperty(key, value);
  }

  // Inject/update custom CSS
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = "theme-custom-css";
    document.head.appendChild(styleElement);
  }
  styleElement.textContent = theme.customCSS;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeDefinition>(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    return (savedId && themeMap[savedId]) || midnightEmber;
  });

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const setTheme = useCallback((id: string) => {
    const theme = themeMap[id];
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
