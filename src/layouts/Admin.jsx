import { useState, React } from "react";
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import './admin.css';
import { config } from '../utils/config';
import Logo from '../assets/logo/logo.png'

export default function Admin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const API_URL = config.API_URL;
        try {
            const response = await fetch(`${API_URL}/api/auth/login/admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            
            const data = await response.json();
            
            if (data.success) { // Changed from data.key to data.success to match backend response
                localStorage.setItem('adminKey', data.success);
                navigate('/admin/dashboard');
            } else {
                setError(data.failed || 'Login failed');
            }
        } catch (err) {
            setError('Invalid credentials');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
      <div className="admin-container">
        <div className="admin-card">
          <img
            src={Logo}
            alt="Logo"
            className="admin-logo"
            style={{ width: "100%" }}
          />
          <h1>Admin Login</h1>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label>Username</label>
            </div>
            <div className="input-group">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Password</label>
            </div>
            <button
              type="submit"
              className={`login-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
}