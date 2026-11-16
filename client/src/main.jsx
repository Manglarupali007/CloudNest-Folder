import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { FileProvider } from './context/FileContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <FileProvider>
        <App />
      </FileProvider>
    </AuthProvider>
  </React.StrictMode>
);
