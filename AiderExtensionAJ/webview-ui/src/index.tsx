import React from "react";
import { App } from "./components/App";
import "./styles/index.css";
import { createRoot } from "react-dom/client";

console.log("Webview index.tsx is running");
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

console.log("React app has been rendered");
