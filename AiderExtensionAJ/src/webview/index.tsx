import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/App';
import './styles/index.css';

console.log('Webview index.tsx is running');

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);

console.log('React app has been rendered');