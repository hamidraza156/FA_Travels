import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './LogoutButton.css'; // Optional: add styling

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
};

export default LogoutButton;
