import React, { useState, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ModeSelector } from './ModeSelector';
import { useVSCodeApi } from '../hooks/useVSCodeApi';
import { useVSCodeTheme } from '../hooks/useVSCodeTheme';

console.log('App component is rendering');

type MessageSender = 'User' | 'Aider';

interface Message {
    sender: MessageSender;
    content: string;
}

interface Settings {
    provider: string;
    model: string;
}

export const App: React.FC = () => {
    const vscode:any = useVSCodeApi();
    const theme = useVSCodeTheme();
    const [messages, setMessages] = useState<Message[]>([]);
    const [mode, setMode] = useState<'edit' | 'chat'>('edit');
    const [settings, setSettings] = useState<Settings>({ provider: 'gemini', model: 'gemini/gemini-1.5-flash' });

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            console.log('Received message in App:', message);
            switch (message.type) {
                case 'aiderResult':
                    setMessages(prev => [...prev, { sender: 'Aider', content: message.result }]);
                    break;
                case 'settings':
                    setSettings(message.settings);
                    break;
            }
        };

        window.addEventListener('message', handleMessage);

        // Request initial settings
        vscode.postMessage({ type: 'getSettings' });

        return () => window.removeEventListener('message', handleMessage);
    }, [vscode]);

    const sendMessage = (content: string) => {
        if (vscode) {
            setMessages(prev => [...prev, { sender: 'User', content }]);
            vscode.postMessage({ type: 'runAider', prompt: content, mode });
        }
    };

    const updateSettings = (newSettings: Partial<Settings>) => {
        if (vscode) {
            const updatedSettings = { ...settings, ...newSettings };
            setSettings(updatedSettings);
            vscode.postMessage({ type: 'updateSettings', settings: updatedSettings });
        }
    };

    return (
        <div style={{ color: theme.foreground, backgroundColor: theme.background }}>
            <h1>AI Coding Assistant</h1>
            <ModeSelector mode={mode} setMode={setMode} />
            <div className="settings">
                <label>
                    Provider:
                    <select
                        value={settings.provider}
                        onChange={(e) => updateSettings({ provider: e.target.value })}
                    >
                        <option value="gemini">Gemini</option>
                        <option value="groq">Groq</option>
                        <option value="openrouter">Openrouter</option>
                    </select>
                </label>
                <label>
                    Model:
                    <input
                        type="text"
                        value={settings.model}
                        onChange={(e) => updateSettings({ model: e.target.value })}
                    />
                </label>
            </div>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <ChatMessage key={index} sender={msg.sender} content={msg.content} />
                ))}
            </div>
            <ChatInput onSend={sendMessage} />
        </div>
    );
};