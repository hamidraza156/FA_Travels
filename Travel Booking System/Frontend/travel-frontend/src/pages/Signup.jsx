import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../api/axios';
import "../styles/Auth.css";
import { toast } from 'react-toastify';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('auth/register/', {
        name,
        email,
        password,
        role: 'user'  // Required by the backend
      });

      // Store token and optional role
      localStorage.setItem('token', response.data.token || '');
      localStorage.setItem('role', response.data.role || 'user');

      toast.success('Signup successful! Redirecting...');

      // Redirect based on role after a short delay so user sees toast
      setTimeout(() => {
        if (response.data.role === 'admin') {
          navigate('/admin/panel');
        } else {
          navigate('/');
        }
      }, 1500);

    } catch (err) {
      console.error(err.response?.data);
      const errorMsg = err.response?.data?.detail || 'Signup failed. Please try again.';
      toast.error(errorMsg);
    }
  };

  return (
    <form className="form" onSubmit={handleSignup}>
      <h2>User Signup</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <span className="toggle-eye" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>
      <button type="submit">Sign Up</button>
      <p className="switch-auth">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
};

export default Signup;
