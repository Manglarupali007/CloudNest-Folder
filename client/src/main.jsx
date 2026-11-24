import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { FileProvider } from './context/FileContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <FileProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </FileProvider>
    </AuthProvider>
  </React.StrictMode>
);
