import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Navbar from './components/Navbar';
import { config } from '../../utils/config';
import './Content.css';
import QuizManager from './components/QuizManager';
import QuizModal from './components/QuizModal';
import SharedQuestions from './SharedQuestions';

const Content = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [news, setNews] = useState([]);
  const [tab, setTab] = useState('news'); // news, assessments, quiz, mcq
  const [showQuizModal, setShowQuizModal] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Try parsing date in DDMMYYYY format
        const day = dateString.substring(0, 2);
        const month = dateString.substring(2, 4);
        const year = dateString.substring(4, 8);
        return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const adminKey = localStorage.getItem('adminKey');
        if (!adminKey) {
          navigate('/admin');
          return;
        }

        const response = await fetch(`${config.API_URL}/api/admin/content`, {
          headers: {
            'Authorization': `Bearer ${adminKey}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }

        const data = await response.json();
        setNews(data.news || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [navigate]);

  const handleQuizSubmit = (quizData) => {
    console.log('Quiz submitted:', quizData);
    setShowQuizModal(false);
  };

  if (loading) return <div className="loading">Loading content...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className={`admin-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <Navbar onCollapse={setIsSidebarCollapsed} />
      
      <div className="content-wrapper">
        <div className="content-header">
          <h1>Content Management</h1>
          
          <div className="content-tabs">
            <button 
              className={`tab-btn ${tab === 'news' ? 'active' : ''}`}
              onClick={() => setTab('news')}
            >
              News
            </button>
            <button 
              className={`tab-btn ${tab === 'assessments' ? 'active' : ''}`}
              onClick={() => setTab('assessments')}
            >
              Assessments
            </button>
            <button 
              className={`tab-btn ${tab === 'quiz' ? 'active' : ''}`}
              onClick={() => setTab('quiz')}
            >
              Quiz
            </button>
            <button 
              className={`tab-btn ${tab === 'mcq' ? 'active' : ''}`}
              onClick={() => setTab('mcq')}
            >
              MCQ Management
            </button>
          </div>
        </div>

        {tab === 'news' && (
          <div className="news-section">
            <div className="section-header">
              <h2>News Management</h2>
              <button className="add-btn">Add News</button>
            </div>
            
            <div className="news-list">
              {news.map((item) => (
                <div key={item.id} className="news-item">
                  <div className="news-info">
                    <h3>{item.title}</h3>
                    <p>{formatDate(item.date)}</p>
                    <p className="last-updated">{item.last_updated ? `Last updated: ${formatDate(item.last_updated)}` : ''}</p>
                  </div>
                  <div className="news-actions">
                    <button className="edit-btn">Edit</button>
                    <button className="delete-btn">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'assessments' && (
          <div className="assessments-section">
            <div className="section-header">
              <h2>Assessments Management</h2>
              <button className="add-btn">Add Assessment</button>
            </div>
            {/* Assessment content here */}
          </div>
        )}

        {tab === 'quiz' && (
          <div className="quiz-section">
            <div className="section-header">
              <h2>Quiz Management</h2>
              <button 
                className="add-btn"
                onClick={() => setShowQuizModal(true)}
              >
                Add Quiz
              </button>
            </div>
            
            <QuizManager />
            
            {showQuizModal && (
              <QuizModal
                onClose={() => setShowQuizModal(false)}
                onSubmit={handleQuizSubmit}
              />
            )}
          </div>
        )}

        {tab === 'mcq' && (
          <div className="mcq-section">
            <div className="section-header">
              <h2>MCQ Management</h2>
            </div>
            <SharedQuestions />
          </div>
        )}
      </div>
    </div>
  );
};

export default Content;
