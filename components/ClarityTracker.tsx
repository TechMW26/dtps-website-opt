'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

declare global {
    interface Window {
        __dtpsClarityInitialized?: boolean;
    }
}

type ClarityTrackerProps = {
    projectId?: string;
    enabledHosts?: string[];
    allowInDevelopment?: boolean;
};

export default function ClarityTracker({
    projectId,
    enabledHosts = [],
    allowInDevelopment = false,
}: ClarityTrackerProps) {
    useEffect(() => {
        if (!projectId || typeof window === 'undefined' || window.__dtpsClarityInitialized) {
            return;
        }

        const isDevelopment = process.env.NODE_ENV !== 'production';
        if (isDevelopment && !allowInDevelopment) {
            return;
        }

        if (enabledHosts.length > 0) {
            const currentHost = window.location.hostname.toLowerCase();
            const isAllowedHost = enabledHosts.some((host) => host.toLowerCase() === currentHost);
            if (!isAllowedHost) {
                return;
            }
        }

        Clarity.init(projectId);
        window.__dtpsClarityInitialized = true;
    }, [projectId, enabledHosts, allowInDevelopment]);

    return null;
}
