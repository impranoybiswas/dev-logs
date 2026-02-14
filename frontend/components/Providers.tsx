'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme as antdTheme, App } from 'antd';
import { useTheme } from 'next-themes';
import { ThemeProvider } from './ThemeProvider';
import AntdStatic from './AntdStatic';

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
                    <ConfigWrapper>
                        {children}
                    </ConfigWrapper>
                </QueryClientProvider>
            </AntdRegistry>
        </ThemeProvider>
    );
}

function ConfigWrapper({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme();
    const mounted = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );

    const isDarkMode = mounted && resolvedTheme === 'dark';

    return (
        <ConfigProvider
            theme={{
                algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#6366f1', // Indigo
                    borderRadius: 12,
                    fontFamily: 'var(--font-sans)',
                },
                components: {
                    Card: {
                        boxShadow: isDarkMode
                            ? '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                            : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
                    },
                    Button: {
                        borderRadius: 5,
                        fontWeight: 600,
                    },
                }
            }}
        >
            <App>
                <AntdStatic />
                {children}
            </App>
        </ConfigProvider>
    );
}
