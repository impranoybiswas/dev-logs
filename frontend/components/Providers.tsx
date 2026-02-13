'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { useTheme } from 'next-themes';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const { resolvedTheme } = useTheme();
    const mounted = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );

    if (!mounted) {
        // Return a placeholder with the same structure but no theme-dependent content
        // to minimize layout shift during hydration
        return <>{children}</>;
    }

    const isDarkMode = resolvedTheme === 'dark';

    return (
        <AntdRegistry>
            <QueryClientProvider client={queryClient}>
                <ConfigProvider
                    theme={{
                        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
                        token: {
                            colorPrimary: '#6366f1', // Indigo
                            borderRadius: 12,        // Modern rounded corners
                            fontFamily: 'var(--font-sans)',
                        },
                        components: {
                            Card: {
                                boxShadow: isDarkMode
                                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                                    : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
                            },
                            Button: {
                                borderRadius: 10,
                                fontWeight: 600,
                            },
                        }
                    }}
                >
                    {children}
                </ConfigProvider>
            </QueryClientProvider>
        </AntdRegistry>
    );
}
