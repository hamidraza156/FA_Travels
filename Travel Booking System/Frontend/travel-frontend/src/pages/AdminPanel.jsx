import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/AdminPanel.css';
import { toast } from 'react-toastify';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [newLocation, setNewLocation] = useState({ name: '', description: '', price: '', image: '' });
  const [editingBooking, setEditingBooking] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editGuests, setEditGuests] = useState(1);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const ADMIN_CODE = '2345';
  const role = Cookies.get('role');
  const token = Cookies.get('token');

  useEffect(() => {
    if (role === 'admin' && token) {
      fetchUsers();
      fetchDestinations();
    }
  }, [role, token]);

  const fetchUsers = async () => {
    try {
      // Updated with /api prefix for admin users-bookings
      const response = await api.get('/admin/users-with-bookings/');
      setUsers(response.data);
    } catch (err) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchDestinations = async () => {
    try {
      // No change here
      const res = await api.get('destinations/');
      setDestinations(res.data);
    } catch (err) {
      toast.error('Failed to fetch destinations');
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (adminCode !== ADMIN_CODE) {
      toast.error('Invalid admin code');
      return;
    }

    try {
      const url = isSignup ? 'signup/' : 'login/';
      const response = await api.post(url, { email, password, role: 'admin' });
      Cookies.set('token', response.data.token);
      Cookies.set('role', response.data.role);

      if (response.data.role === 'admin') {
        toast.success(isSignup ? 'Admin registered' : 'Login successful');
        navigate('/admin-panel'); // Ensure route is defined in React Router
        window.location.reload(); // Ensure immediate refresh to load data
      } else {
        toast.error('Access denied');
      }
    } catch (err) {
      toast.error('Authentication failed');
      setError('Invalid credentials or signup failed.');
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    toast.success('Logout successful');
    navigate('/login');
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`admin/delete-user/${userId}/`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Error deleting user');
    }
  };

  const prepareEditBooking = (booking) => {
    setEditingBooking(booking);
    setEditDate(booking.date);
    setEditGuests(booking.guests);
  };

  const submitEditBooking = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;

    try {
      await api.put(`bookings/${editingBooking.id}/`, {
        destination: editingBooking.destination,
        hotel: editingBooking.hotel,
        transport: editingBooking.transport,
        date: editDate,
        guests: Number(editGuests),
      });
      toast.success('Booking updated');
      setEditingBooking(null);
      fetchUsers();
    } catch {
      toast.error('Error updating booking');
    }
  };

  if (role !== 'admin' || !token) {
    return (
      <div className="admin-panel">
        <div className="auth-box">
          <h2>{isSignup ? 'Admin Signup' : 'Admin Login'}</h2>
          <form onSubmit={handleAuth}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <input type="text" placeholder="Admin Code" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} required />
            <button type="submit">{isSignup ? 'Sign Up' : 'Log In'}</button>
          </form>
          <p>
            {isSignup ? 'Already have an account?' : 'Need an account?'}{' '}
            <button onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? 'Login' : 'Sign Up'}
            </button>
          </p>
          {error && <p className="error-msg">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-dashboard">
        <h2>Admin Panel</h2>
        <button className="logout-button" onClick={handleLogout}>Logout</button>

        <h3>Users and Bookings</h3>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Bookings</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={idx}>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  {user.bookings?.map((booking, bIdx) => (
                    <div key={bIdx} className="booking-box">
                      <p><strong>{booking.destination}</strong> on {booking.date}</p>
                      <p>Guests: {booking.guests}</p>
                      <p>Hotel: {booking.hotel_detail?.name}</p>
                      <p>Transport: {booking.transport_detail?.type} - {booking.transport_detail?.description}</p>
                      <button className="edit-btn" onClick={() => prepareEditBooking(booking)}>✏️</button>
                      <button className="delete-btn" onClick={() => handleDeleteBooking(booking.id)}>🗑</button>
                    </div>
                  ))}
                </td>
                <td>
                  <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>Delete User</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editingBooking && (
          <div className="edit-booking-form">
            <h4>Edit Booking</h4>
            <form onSubmit={submitEditBooking}>
              <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
              <input type="number" min={1} value={editGuests} onChange={(e) => setEditGuests(e.target.value)} required />
              <button type="submit" className="save-btn">Save</button>
              <button type="button" className="cancel-btn" onClick={() => setEditingBooking(null)}>Cancel</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
