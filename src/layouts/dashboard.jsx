import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { Target, Award } from 'react-feather';
import Sidebar from '../components/Sidebar';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { useSidebar } from '../context/SidebarContext';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const navigate = useNavigate();
    const { isSidebarOpen } = useSidebar();
    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        const fetchUserData = async (user) => {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserData(data);
                    
                    // Fetch assessments if assessment_count > 0
                    if (data.assessment_count > 0) {
                        const assessmentsRef = collection(db, "assessment");
                        const q = query(assessmentsRef, where("userId", "==", user.uid));
                        const querySnapshot = await getDocs(q);
                        const assessmentData = [];
                        querySnapshot.forEach((doc) => {
                            assessmentData.push({ id: doc.id, ...doc.data() });
                        });
                        setAssessments(assessmentData);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                fetchUserData(user);
            } else {
                navigate('/signup');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        // Add or remove no-scroll class based on sidebar state on mobile
        if (window.innerWidth <= 768) {
            document.body.classList.toggle('no-scroll', isSidebarOpen);
        }
        
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [isSidebarOpen]);

    if (!user || !userData) return <div>Loading...</div>;

    return (
        <div style={{ 
            display: 'flex',
            minHeight: '100vh',
            position: 'relative',
            overflow: isSidebarOpen && window.innerWidth <= 768 ? 'hidden' : 'auto'
        }}>
            <Sidebar />
            <div style={{ 
                marginLeft: isSidebarOpen && window.innerWidth > 768 ? '250px' : '0',
                padding: '20px',
                backgroundColor: '#f5f5f5',
                width: '100%',
                transition: 'margin-left 0.3s ease',
                position: 'relative',
                zIndex: 1
            }}>
                {!isSidebarOpen && (
                    <div style={{ height: '60px' }} /> // Spacer for the menu button
                )}
                
                {isSidebarOpen && (
                    <div style={{
                        backgroundColor: '#8A2BE2',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        color: 'white',
                        display: 'inline-flex',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <span style={{ marginRight: '10px' }}>🎉</span>
                        Get Yearly subscription @ ₹1 per day
                    </div>
                )}

                <div style={{ 
                    marginBottom: '30px',
                    marginTop: isSidebarOpen ? '0' : '20px'
                }}>
                    <p style={{ 
                        color: '#666',
                        fontSize: '14px',
                        marginBottom: '8px'
                    }}>Welcome Back</p>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        Hello, {userData.name || 'Student'} 
                        <span style={{ fontSize: '24px' }}>👋</span>
                    </h1>
                </div>

                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    marginBottom: '20px'
                }}>Study statistics</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <Award size={24} color="#8A2BE2" />
                        <div>
                            <p style={{ color: '#666' }}>Ranking</p>
                            <h2 style={{ margin: '5px 0' }}>{userData.rank || 'N/A'}</h2>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <Target size={24} color="#8A2BE2" />
                        <div>
                            <p style={{ color: '#666' }}>Score</p>
                            <h2 style={{ margin: '5px 0' }}>{userData.total_score}/100</h2>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <Target size={24} color="#8A2BE2" />
                        <div>
                            <p style={{ color: '#666' }}>Accuracy</p>
                            <h2 style={{ margin: '5px 0' }}>{userData.accuracy}%</h2>
                        </div>
                    </div>
                </div>

                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    marginBottom: '20px',
                    marginTop: '40px'
                }}>Table analysis</h2>
                {userData.assessment_count === 0 ? (
                    <div style={{
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '15px',
                        textAlign: 'center',
                        color: '#666'
                    }}>
                        No Sufficient Data
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: 'white',
                        padding: isMobile ? '10px' : '20px',
                        borderRadius: '15px',
                        overflowX: 'auto'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>No. Questions</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Correct</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Incorrect</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Skipped</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Accuracy</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Score</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Duration</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Rank</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assessments.map((assessment) => (
                                    <tr key={assessment.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{assessment.totalQuestions}</td>
                                        <td style={{ padding: '10px' }}>{assessment.correct}</td>
                                        <td style={{ padding: '10px' }}>{assessment.incorrect}</td>
                                        <td style={{ padding: '10px' }}>{assessment.skipped}</td>
                                        <td style={{ padding: '10px' }}>{assessment.accuracy}%</td>
                                        <td style={{ padding: '10px' }}>{assessment.score}</td>
                                        <td style={{ padding: '10px' }}>{assessment.duration}</td>
                                        <td style={{ padding: '10px' }}>{assessment.rank}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
} 