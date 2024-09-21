import { useEffect, useState } from 'react';
import { useVSCodeApi } from './useVSCodeApi';

interface VSCodeTheme {
    kind: 1 | 2 | 3; // 1: Light, 2: Dark, 3: High Contrast
    foreground: string;
    background: string;
}

export const useVSCodeTheme = (): VSCodeTheme => {
    const vscode = useVSCodeApi();
    const [theme, setTheme] = useState<VSCodeTheme>({
        kind: 2, // Default to dark theme
        foreground: '#FFFFFF',
        background: '#1E1E1E',
    });

    useEffect(() => {
        if (!vscode) {
            console.warn('VSCode API not available');
            return;
        }

        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            if (message.type === 'theme') {
                setTheme(message.theme);
            }
        };

        window.addEventListener('message', handleMessage);

        // Request the current theme when the component mounts
        vscode.postMessage({ type: 'getTheme' });

        return () => window.removeEventListener('message', handleMessage);
    }, [vscode]);

    return theme;
};