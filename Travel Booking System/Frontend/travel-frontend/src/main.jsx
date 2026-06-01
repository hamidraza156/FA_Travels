import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

// ✅ Import Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ✅ Set theme from localStorage
const theme = localStorage.getItem('theme');
document.body.className = theme === 'dark' ? 'dark-mode' : 'light-mode';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <>
      <App />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  </React.StrictMode>
);
