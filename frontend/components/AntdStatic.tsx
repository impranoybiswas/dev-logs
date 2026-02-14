'use client';

import { App } from 'antd';
import { useEffect } from 'react';
import { setStaticFunctions } from '@/lib/antd';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';

/**
 * This component is used to extract the static functions from the Ant Design App context
 * and make them available globally. This avoids the warning about static functions
 * not being able to consume context.
 */
export default function AntdStatic() {
    const staticFunctions = App.useApp();

    useEffect(() => {
        setStaticFunctions({
            message: staticFunctions.message,
            notification: staticFunctions.notification,
            modal: staticFunctions.modal as unknown as ModalStaticFunctions,
        });
    }, [staticFunctions]);

    return null;
}
