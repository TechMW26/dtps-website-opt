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
};

export default function ClarityTracker({ projectId }: ClarityTrackerProps) {
    useEffect(() => {
        if (!projectId || typeof window === 'undefined' || window.__dtpsClarityInitialized) {
            return;
        }

        Clarity.init(projectId);
        window.__dtpsClarityInitialized = true;
    }, [projectId]);

    return null;
}
