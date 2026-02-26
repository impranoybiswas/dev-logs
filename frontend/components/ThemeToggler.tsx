import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useTheme } from "next-themes";

export default function ThemeToggler({className}: {className?: string}) {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`${className}`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <SunOutlined/>
      ) : (
        <MoonOutlined />
      )}
    </button>
  );
}
