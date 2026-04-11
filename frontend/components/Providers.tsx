"use client";

import React, { useState, useSyncExternalStore } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, theme as antdTheme, App } from "antd";
import { useTheme } from "next-themes";
import { ThemeProvider } from "./ThemeProvider";
import AntdStatic from "./AntdStatic";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AntdRegistry>
        <QueryClientProvider client={queryClient}>
          <ConfigWrapper>{children}</ConfigWrapper>
        </QueryClientProvider>
      </AntdRegistry>
    </ThemeProvider>
  );
}

function ConfigWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isDarkMode = mounted && resolvedTheme === "dark";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: isDarkMode
            ? "hsl(245, 82%, 67%)"
            : "hsl(245, 82%, 67%)",
          borderRadius: 12,
          fontFamily: "var(--font-outfit), var(--font-sans)",
          colorBgBase: isDarkMode ? "hsl(240, 10%, 4%)" : "#fafafa",
          colorTextBase: isDarkMode ? "hsl(0, 0%, 98%)" : "#09090b",
          wireframe: false,
        },
        components: {
          Card: {
            boxShadow: isDarkMode
              ? "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)"
              : "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
            borderRadiusLG: 24,
            paddingLG: 24,
          },
          Button: {
            borderRadius: 12,
            fontWeight: 700,
            controlHeight: 44,
            boxShadow: "none",
            primaryShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.39)",
          },
          Input: {
            borderRadius: 12,
            controlHeight: 44,
          },
          Select: {
            borderRadius: 12,
            controlHeight: 44,
          },
        },
      }}
    >
      <App>
        <AntdStatic />
        {children}
      </App>
    </ConfigProvider>
  );
}
