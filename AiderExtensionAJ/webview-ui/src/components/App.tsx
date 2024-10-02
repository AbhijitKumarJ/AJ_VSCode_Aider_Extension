import React, { useState, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ModeSelector } from "./ModeSelector";
import { useVSCodeApi } from "../hooks/useVSCodeApi";
import { useVSCodeTheme } from "../hooks/useVSCodeTheme";

console.log("App component is rendering");

type MessageSender = "User" | "Aider";

interface Message {
  sender: MessageSender;
  content: string;
}

interface Settings {
  provider: string;
  model: string;
}

export const App: React.FC = () => {
  const vscode = useVSCodeApi();
  const theme = useVSCodeTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<"edit" | "chat">("edit");
  const [settings, setSettings] = useState<Settings>({
    provider: "gemini",
    model: "gemini/gemini-1.5-flash",
  });
  const [terminalOutput, setTerminalOutput] = useState<string>("");

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log("Received message in App:", message);
      switch (message.type) {
        case "terminalOutput":
          setTerminalOutput((prev) => prev + message.data);
          break;
        case "settings":
          setSettings(message.settings);
          break;
      }
    };

    window.addEventListener("message", handleMessage);

    // Request initial settings
    if (vscode) {
      vscode.postMessage({ type: "getSettings" });
    }

    return () => window.removeEventListener("message", handleMessage);
  }, [vscode]);

  const sendMessage = (content: string) => {
    if (vscode) {
      setMessages((prev) => [...prev, { sender: "User", content }]);
      vscode.postMessage({ type: "runAider", command: content });
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    if (vscode) {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      vscode.postMessage({ type: "updateSettings", settings: updatedSettings });
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>AI Coding Assistant</h1>
        <ModeSelector mode={mode} setMode={setMode} />
      </header>
      <main>
        <div className="settings-panel">
          <h2>Settings</h2>
          <div className="settings-form">
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
        </div>
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                sender={msg.sender}
                content={msg.content}
              />
            ))}
          </div>
          <TerminalOutput output={terminalOutput} />
          <ChatInput onSend={sendMessage} />
        </div>
      </main>
    </div>
  );
};

const TerminalOutput: React.FC<{ output: string }> = ({ output }) => {
  return (
    <div className="terminal-output">
      <pre>{output}</pre>
    </div>
  );
};
