// UserMenu.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Usermenu.css';

const UserMenu = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const userName = Cookies.get('username');
  const role = Cookies.get('role');

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    window.location.href = '/login';
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="user-menu">
      <button onClick={toggleMenu} className="user-menu-button">
        {userName || 'User'} ▼
      </button>
      <div className={`user-dropdown ${isOpen ? 'open' : ''}`}>
        <button onClick={handleLogout} className="dropdown-item">Logout</button>
        {role === 'admin' && (
          <button onClick={() => navigate('/admin')} className="dropdown-item">
            Admin Panel
          </button>
        )}
      </div>
    </div>
  );
};

export default UserMenu;
