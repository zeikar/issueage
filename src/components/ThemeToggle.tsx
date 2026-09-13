import { useEffect, useState } from "react";

// the class is set by the inline script in Base.astro before hydration, so start neutral here and read it once mounted, or the server and client markup would disagree
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    // update the class and state first, so a storage write failure below can't leave aria-pressed out of sync with the class
    document.documentElement.classList.toggle("dark", next);
    setIsDark(next);
    try {
      localStorage.theme = next ? "dark" : "light";
    } catch {
      // storage may be blocked; the toggle still works for this session
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Dark theme"
      aria-pressed={isDark}
      className="rounded p-2 hover:opacity-80"
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}
