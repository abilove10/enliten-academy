import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Award } from 'react-feather';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../context/SidebarContext';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { api } from '../utils/api';
import { config } from '../utils/config';

//images
import trophy from '../assets/images/trophy.png';
import score from '../assets/images/score.png';
import accuracy from '../assets/images/accuracy.png';
// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const API_URL = config.API_URL;

// Create a context for user data
export const UserContext = createContext(null);

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [subjectData, setSubjectData] = useState({
        labels: [],
        values: []
    });
    const navigate = useNavigate();
    const { isSidebarOpen } = useSidebar();
    const isMobile = window.innerWidth <= 768;
    const [contentWidth, setContentWidth] = useState('100%');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Create a memoized auth check function
    const checkAuth = useCallback(async () => {
        try {
            console.log('Checking authentication...');
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.log('No token found, redirecting to login');
                navigate('/', { replace: true });
                return false;
            }

            // Verify token with backend
            const response = await api.fetchUserData();
            if (!response) {
                console.log('Invalid session, redirecting to login');
                localStorage.removeItem('token');
                navigate('/', { replace: true });
                return false;
            }
            
            setUserData(response);
            if(response.assessment_count>0){

                setAssessments(await api.fetchUserAssessments());
            }
            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            navigate('/', { replace: true });
            return false;
        }
    }, [navigate]);

    // Use the checkAuth function in useEffect
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(()=>{
        async function get_assesment() {
            
            if(userData){
                if(userData.assessment_count>0){
    
                    setAssessments(await api.fetchUserAssessments());
                }
            }
        }
        get_assesment();
    },[userData])

    // Modify the fetchUserData function
    const fetchUserData = useCallback(async () => {
        try {
            if (!(await checkAuth())) return;

            // setLoading(true);
            console.log('Fetching user data...');
            
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/user/data`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            console.log('User data response status:', response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Unauthorized response, clearing token');
                    localStorage.removeItem('token');
                    navigate('/', { replace: true });
                    return;
                }
                throw new Error('Failed to fetch user data');
            }

            const data = await response.json();
            console.log('Received user data:', data);
            
            if (!data) {
                throw new Error('No data received');
            }
            
            setUserData(data);
        } catch (err) {
            console.error('Error in fetchUserData:', err);
            setError(err.message);
            
            if (err.message.includes('401') || err.message.includes('unauthorized')) {
                localStorage.removeItem('token');
                navigate('/', { replace: true });
            }
        } 
        finally {
            setLoading(false);
        }
    }, [navigate, checkAuth]);

    // Use the fetchUserData function in an effect
    useEffect(() => {
        const authenticateAndFetchData = async () => {
            if (await checkAuth()) {
                fetchUserData();
                // setAssessments(await api.fetchUserAssessments());
            }
        };
        authenticateAndFetchData();
    }, [checkAuth, fetchUserData]);

    useEffect(() => {
        // Add or remove no-scroll class based on sidebar state on mobile
        if (window.innerWidth <= 768) {
            document.body.classList.toggle('no-scroll', isSidebarOpen);
        }
        
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [isSidebarOpen]);

    useEffect(() => {
        const updateContentWidth = () => {
            const sidebarWidth = 300; // Width of sidebar
            const windowWidth = window.innerWidth;
            
            if (windowWidth <= 768) {
                setContentWidth('100%');
            } else {
                setContentWidth(isSidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%');
            }
        };

        // Update initially
        updateContentWidth();

        // Add resize listener
        window.addEventListener('resize', updateContentWidth);

        // Cleanup
        return () => window.removeEventListener('resize', updateContentWidth);
    }, [isSidebarOpen]);

    // Update the chart options configuration
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'x',
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: {
                    display: true,
                    color: '#f0f0f0',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 12
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 0,
                    minRotation: 0,
                    autoSkip: false,
                    font: {
                        size: 11
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
        layout: {
            padding: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20
            }
        }
    };

    // Update the table styling section
    const tableStyles = {
        container: {
            backgroundColor: '#F8F2FF',
            padding: '20px',
            borderRadius: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            marginTop: '20px',
            width: '100%'
        },
        table: {
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0 8px',
            margin: '10px 0',
            minWidth: '800px'
        },
        th: {
            padding: '12px 20px',
            textAlign: 'left',
            color: '#666',
            fontWeight: '500',
            fontSize: '14px',
            backgroundColor: 'transparent'
        },
        td: {
            padding: '12px 20px',
            backgroundColor: 'white',
            color: '#333',
            fontSize: '14px'
        },
        tr: {
            transition: 'all 0.2s'
        },
        'td:first-child': {
            borderTopLeftRadius: '8px',
            borderBottomLeftRadius: '8px'
        },
        'td:last-child': {
            borderTopRightRadius: '8px',
            borderBottomRightRadius: '8px'
        }
    };

    // Add this chart data configuration
    const chartData = {
        labels: subjectData.labels,
        datasets: [
            {
                data: subjectData.values,
                backgroundColor: '#8A2BE2',
                borderRadius: 6,
                barThickness: 20,
            }
        ]
    };

    const handleLogout = async () => {
        try {
            // Call backend logout endpoint
            await api.logout();
            localStorage.removeItem('token');
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            // Still remove token and redirect even if logout fails
            localStorage.removeItem('token');
            navigate('/', { replace: true });
        }
    };

    if (loading) {
        return (
            <>
            <Sidebar />
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                Loading...
            </div>
                </>
        );
    }

    if (error) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                padding: '20px'
            }}>
                <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>
                <button 
                    onClick={async() =>{ fetchUserData();
                        // setAssessments(await api.fetchUserAssessments())
                        }}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        backgroundColor: '#8A2BE2',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!userData) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                padding: '20px'
            }}>
                <p style={{ color: 'red', marginBottom: '20px' }}>No user data available</p>
                <button 
                    onClick={async() =>{ fetchUserData();
                        // setAssessments(await api.fetchUserAssessments())
                    }}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        backgroundColor: '#8A2BE2',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    // Provide user data to children
    return (
        <UserContext.Provider value={userData}>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar />
                <div style={{ 
                    width: contentWidth,
                    marginLeft: isSidebarOpen && window.innerWidth > 768 ? '300px' : '0',
                    padding: '30px',
                    backgroundColor: '#FCF6FF',
                    transition: 'all 0.3s ease',
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

                    <div style={{
                        marginBottom: '30px'
                    }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            marginBottom: '20px'
                        }}>Subject Analysis</h2>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '15px',
                            height: '400px',
                            width: '100%',
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            transition: 'width 0.3s ease'
                        }}>
                            <div style={{
                                minWidth: '800px',
                                height: '100%'
                            }}>
                                <Bar options={chartOptions} data={chartData} />
                            </div>
                        </div>
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
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center',gap:"10px" }}>
                                    <Award size={24} color="#8A2BE2" />
                                    <p style={{ color: '#666' }}>Ranking</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center',justifyContent: 'space-between',width: '95%',paddingLeft:"5%" }}>
                                    <h2 style={{ margin: '5px 0' }}>{userData.rank || 'N/A'}</h2>
                                    <img src={trophy} alt="Rank" width={'25%'} />
                                </div>
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
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center',gap:"10px" }}>
                                        <Target size={24} color="#8A2BE2" />
                                        <p style={{ color: '#666' }}>Score</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center',justifyContent: 'space-between',width: '95%',paddingLeft:"5%" }}>
                                    <h2 style={{ margin: '5px 0' }}>{userData.total_score}/100</h2>
                                    <img src={score} alt="Rank" width={'20%'} />
                                </div>
                                
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
                            <div>
                            <div style={{ display: 'flex', alignItems: 'center',gap:"10px" }}>
                                        <Target size={24} color="#8A2BE2" />
                                        <p style={{ color: '#666' }}>Accuracy</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center',justifyContent: 'space-between',width: '95%',paddingLeft:"5%" }}>
                                    <h2 style={{ margin: '5px 0' }}>{userData.accuracy}%</h2>
                                    <img src={accuracy} alt="Rank" width={'20%'} />
                                </div>
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
                            color: '#666',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            No Sufficient Data
                        </div>
                    ) : (
                        <div style={{
                            ...tableStyles.container,
                            transition: 'width 0.3s ease',
                            width: '100%'
                        }}>
                            <div style={{
                                overflowX: 'auto',
                                width: '100%'
                            }}>
                                <table style={tableStyles.table}>
                                    <thead>
                                        <tr>
                                            <th style={tableStyles.th}>No. Questions</th>
                                            <th style={tableStyles.th}>Correct</th>
                                            <th style={tableStyles.th}>Incorrect</th>
                                            <th style={tableStyles.th}>Skipped</th>
                                            <th style={tableStyles.th}>Accuracy</th>
                                            <th style={tableStyles.th}>Score</th>
                                            <th style={tableStyles.th}>Duration</th>
                                            <th style={tableStyles.th}>Rank</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assessments.map((assessment) => (
                                            <tr key={assessment.id} style={tableStyles.tr}>
                                                <td style={{...tableStyles.td, ...tableStyles['td:first-child']}}>{assessment.totalQuestions}</td>
                                                <td style={tableStyles.td}>{assessment.correct}</td>
                                                <td style={tableStyles.td}>{assessment.incorrect}</td>
                                                <td style={tableStyles.td}>{assessment.skipped}</td>
                                                <td style={tableStyles.td}>{assessment.accuracy}%</td>
                                                <td style={tableStyles.td}>{assessment.score}</td>
                                                <td style={tableStyles.td}>{assessment.duration}</td>
                                                <td style={{...tableStyles.td, ...tableStyles['td:last-child']}}>{assessment.rank}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </UserContext.Provider>
    );
} 