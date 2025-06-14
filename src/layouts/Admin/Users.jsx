import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Navbar from './components/Navbar';
import UserDetails from './components/UserDetails';
import { config } from '../../utils/config';
import './Users.css';

const Users = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const adminKey = localStorage.getItem('adminKey');
        if (!adminKey) {
          navigate('/admin');
          return;
        }

        const response = await fetch(`${config.API_URL}/api/admin/users`, {
          headers: {
            'Authorization': `Bearer ${adminKey}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(search.toLowerCase()) ||
                         user.email?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ? true :
                         filter === 'active' ? user.subscription_status === 'active' :
                         user.subscription_status !== 'active';
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (user) => {
    setSelectedUser(user);
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className={`admin-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <Navbar onCollapse={setIsSidebarCollapsed} />
      
      <div className="users-content">
        <div className="users-header">
          <h1>Users Management</h1>
          
          <div className="filters">
            <input
              type="search"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Users</option>
              <option value="active">Premium Users</option>
              <option value="inactive">Free Users</option>
            </select>
          </div>
        </div>

        <div className="users-stats">
          <div className="stat-box">
            <h3>Total Users</h3>
            <p>{users.length}</p>
          </div>
          <div className="stat-box">
            <h3>Premium Users</h3>
            <p>{users.filter(u => u.subscription_status === 'active').length}</p>
          </div>
          <div className="stat-box">
            <h3>Free Users</h3>
            <p>{users.filter(u => u.subscription_status !== 'active').length}</p>
          </div>
        </div>

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="user-cell">
                    <img src={user.photo_url || '/default-avatar.png'} alt={user.name} />
                    <span>{user.name || 'Anonymous'}</span>
                  </td>
                  <td>{user.email}</td>
                  <td>{new Date(user.register_time).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${user.subscription_status}`}>
                      {user.subscription_status === 'active' ? 'Premium' : 'Free'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="view-btn"
                      onClick={() => handleViewDetails(user)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedUser && (
          <UserDetails 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Users;
