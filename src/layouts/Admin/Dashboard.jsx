import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Navbar from './components/Navbar';
import { config } from '../../utils/config';
import './Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    conversionRate: 0,
    recentUsers: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const adminKey = localStorage.getItem('adminKey');
        if (!adminKey) {
          navigate('/admin');
          return;
        }

        const response = await fetch(`${config.API_URL}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${adminKey}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        // Transform backend data to match frontend structure
        setStats({
          totalUsers: data.total_users || 0,
          activeUsers: data.active_users || 0,
          totalRevenue: data.total_revenue || 0,
          conversionRate: data.conversion_rate || 0,
          recentUsers: data.recent_users || [],
          recentActivities: data.recent_activities || []
        });
      } catch (err) {
        setError(err.message);
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className={`admin-dashboard ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <Navbar onCollapse={setIsSidebarCollapsed} />
      
      <div className="dashboard-content">
        <h1 className="dashboard-title">Dashboard Overview</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users-icon">👥</div>
            <div className="stat-details">
              <h3>Total Users</h3>
              <p className="stat-value">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active-icon">✨</div>
            <div className="stat-details">
              <h3>Premium Users</h3>
              <p className="stat-value">{stats.activeUsers}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue-icon">💰</div>
            <div className="stat-details">
              <h3>Revenue</h3>
              <p className="stat-value">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon conversion-icon">📈</div>
            <div className="stat-details">
              <h3>Conversion Rate</h3>
              <p className="stat-value">{stats.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card recent-users">
            <h2>Recent Users</h2>
            <div className="user-list">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="user-item">
                  <img src={user.photo_url || '/default-avatar.png'} alt={user.name} />
                  <div className="user-info">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                    <span>{new Date(user.register_time).toLocaleDateString()}</span>
                    <span className="subscription-status">
                      {user.subscription_status === 'active' ? '🟢 Premium' : '⚪ Free'}
                    </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {stats.recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className={`activity-icon ${activity.type}`}>
                    {activity.type === 'payment' ? '💳' : '🔔'}
                  </div>
                  <div className="activity-info">
                    <h4>{activity.type === 'payment' ? 'New Payment' : 'New Activity'}</h4>
                    <p>
                      {activity.type === 'payment' && 
                        `₹${activity.amount} - ${activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}`}
                    </p>
                    <span>{new Date(activity.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
