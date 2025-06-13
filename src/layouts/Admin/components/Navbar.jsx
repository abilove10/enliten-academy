import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminKey');
    window.location.href = '/admin';
  };

  return (
    <nav className="admin-navbar">
      <div className="nav-brand">
        <span className="brand-text">Enliten Admin</span>
      </div>
      
      <div className={`nav-links ${isOpen ? 'active' : ''}`}>
        <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/admin/users" className="nav-link">Users</Link>
        <Link to="/admin/content" className="nav-link">Content</Link>
        <Link to="/admin/analytics" className="nav-link">Analytics</Link>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
};

export default Navbar;
