import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Cookies from 'js-cookie';
import api from '../api/axios';
import "../styles/Auth.css";
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('token');
    const role = Cookies.get('role');
    if (token) {
      if (role === 'admin') {
        navigate('/admin/panel');
      } else {
        navigate('/home'); // Redirect regular user to /home
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('auth/login/', { email, password });
      const { token, role } = response.data;

      // Store token & role in cookies
      Cookies.set('token', token, { expires: 7 });
      Cookies.set('role', role, { expires: 7 });

      toast.success('Login successful! Redirecting...');

      // Redirect after short delay so user can see toast
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin/panel');
        } else {
          navigate('/home');
        }
      }, 1500);

    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Login failed. Please try again.';
      toast.error(errorMsg);
      console.error(error);
    }
  };

  return (
    <form className="form" onSubmit={handleLogin}>
      <h2>User Login</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span
          className="toggle-eye"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      <button type="submit">Login</button>

      <p className="switch-auth">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </form>
  );
};

export default Login;
