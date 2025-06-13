import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Navbar from './components/Navbar';
import { config } from '../../utils/config';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    subjectPerformance: [],
    revenueData: [],
    userTypeDistribution: { premium: 0, free: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const adminKey = localStorage.getItem('adminKey');
        if (!adminKey) {
          navigate('/admin');
          return;
        }

        const response = await fetch(`${config.API_URL}/api/admin/analytics`, {
          headers: {
            'Authorization': `Bearer ${adminKey}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [navigate]);

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="admin-layout">
      <Navbar />
      <div className="analytics-content">
        <h1>Analytics Dashboard</h1>

        <div className="chart-grid">
          {/* User Growth Chart */}
          <div className="chart-card">
            <h2>User Growth</h2>
            <LineChart width={500} height={300} data={analytics.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#8884d8" />
            </LineChart>
          </div>

          {/* Subject Performance Chart */}
          <div className="chart-card">
            <h2>Subject Performance</h2>
            <BarChart width={500} height={300} data={analytics.subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#82ca9d" />
            </BarChart>
          </div>

          {/* Revenue Chart */}
          <div className="chart-card">
            <h2>Revenue Trends</h2>
            <LineChart width={500} height={300} data={analytics.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
            </LineChart>
          </div>

          {/* User Type Distribution */}
          <div className="chart-card">
            <h2>User Distribution</h2>
            <PieChart width={400} height={300}>
              <Pie
                data={[
                  { name: 'Premium Users', value: analytics.userTypeDistribution.premium },
                  { name: 'Free Users', value: analytics.userTypeDistribution.free }
                ]}
                cx={200}
                cy={150}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {analytics.userTypeDistribution && Object.values(analytics.userTypeDistribution).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
