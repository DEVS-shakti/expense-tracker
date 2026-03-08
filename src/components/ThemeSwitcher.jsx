import React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const options = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switcher" role="group" aria-label="Theme selector">
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setTheme(id)}
          className={`theme-switcher-btn ${theme === id ? "active" : ""}`}
          aria-pressed={theme === id}
        >
          <Icon size={15} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
