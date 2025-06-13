import './UserDetails.css';

const UserDetails = ({ user, onClose }) => {
  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>User Details</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="user-details-content">
          <div className="user-profile">
            <img src={user.photo_url || '/default-avatar.png'} alt={user.name} />
            <div className="user-info">
              <h3>{user.name || 'Anonymous'}</h3>
              <p>{user.email}</p>
              <span className={`status-badge ${user.subscription_status}`}>
                {user.subscription_status === 'active' ? 'Premium' : 'Free'}
              </span>
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <label>Join Date</label>
              <span>{formatDate(user.register_time)}</span>
            </div>
            <div className="detail-item">
              <label>Phone Number</label>
              <span>{user.phone_number || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <label>Assessment Count</label>
              <span>{user.assessment_count}</span>
            </div>
            <div className="detail-item">
              <label>Total Score</label>
              <span>{user.total_score}</span>
            </div>
            <div className="detail-item">
              <label>Accuracy</label>
              <span>{user.accuracy}%</span>
            </div>
            {user.subscription_status === 'active' && (
              <>
                <div className="detail-item">
                  <label>Subscription Start</label>
                  <span>{formatDate(user.subscription_start_date)}</span>
                </div>
                <div className="detail-item">
                  <label>Subscription End</label>
                  <span>{formatDate(user.subscription_end_date)}</span>
                </div>
              </>
            )}
          </div>

          <div className="subject-analysis">
            <h3>Subject Analysis</h3>
            <div className="subjects-grid">
              {Object.entries(user.subject_analysis || {}).map(([subject, score]) => (
                <div key={subject} className="subject-item">
                  <label>{subject}</label>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                  <span>{score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
