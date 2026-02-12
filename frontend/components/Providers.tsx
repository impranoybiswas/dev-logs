'use client';

import React, { useState } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme } from 'antd';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <AntdRegistry>
            <QueryClientProvider client={queryClient}>
                <ConfigProvider
                    theme={{
                        algorithm: theme.defaultAlgorithm,
                        token: {
                            colorPrimary: '#1677ff',
                            borderRadius: 6,
                        },
                    }}
                >
                    {children}
                </ConfigProvider>
            </QueryClientProvider>
        </AntdRegistry>
    );
}
