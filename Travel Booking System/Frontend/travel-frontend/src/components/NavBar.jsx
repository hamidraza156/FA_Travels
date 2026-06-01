import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';  // you can use this instead of getCookie helper
import './Navbar.css';
import './Usermenu.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('Guest');
  const [userRole, setUserRole] = useState('user');
  const navigate = useNavigate();

  // Use Cookies lib or fallback to your getCookie
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  useEffect(() => {
    const token = Cookies.get('token') || getCookie('token');
    const email = Cookies.get('userEmail') || getCookie('userEmail');
    const role = Cookies.get('role') || getCookie('role');

    if (token) {
      setIsLoggedIn(true);
      setUserEmail(email || 'User');
      setUserRole(role || 'user');
    } else {
      setIsLoggedIn(false);
      setUserEmail('Guest');
      setUserRole('user');
    }
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear cookies manually
    document.cookie = 'token=; Max-Age=0; path=/;';
    document.cookie = 'userEmail=; Max-Age=0; path=/;';
    document.cookie = 'role=; Max-Age=0; path=/;';

    setIsLoggedIn(false);
    setUserEmail('Guest');
    setUserRole('user');
    closeMenu();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <nav className="navbar">
        <div className='navbar-left'>
          <div className="navbar-brand">FA Travels</div>

          {isLoggedIn ? (
            userRole === 'admin' ? (
              <ul className="navbar-links">
                <li><Link to="/adminpanel">Admin Panel</Link></li>
              </ul>
            ) : (
              <ul className="navbar-links">
                <li><Link to="/home">Home</Link></li>
                <li><Link to="/destinations">Destinations</Link></li>
                <li><Link to="/suggestions">Suggestions</Link></li>
                <li><Link to="/bookings">Bookings</Link></li>
              </ul>
            )
          ) : (
            <ul className="navbar-links">
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Signup</Link></li>
            </ul>
          )}
        </div>
 {/* Show user menu button only when logged in */}
 {isLoggedIn && (
          <div className="navbar-right">
            <button className="user-menu-button" onClick={toggleMenu} aria-label="User menu">
              &#8942;
            </button>
          </div>
        )}
        
      </nav>

      {menuOpen && <div className="menu-overlay" onClick={closeMenu} />}

      {/* User menu slide-in */}
      {isLoggedIn && (
        <div className={`user-slide-menu ${menuOpen ? 'open' : ''}`}>
          <div className="user-info">
            <span>{userEmail}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
