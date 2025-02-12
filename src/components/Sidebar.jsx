import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Settings, BookOpen, MessageSquare, Globe, HelpCircle, LogOut, Menu, X } from 'react-feather';
import { auth } from '../firebase/config';
import Logo from '../assets/logo/logo.png';
import { useSidebar } from '../context/SidebarContext';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
    
    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/signup');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const menuItems = [
        { title: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
        { title: 'AI consultant', icon: <MessageSquare size={20} />, path: '/ai-consultant' },
        { title: 'News', icon: <Globe size={20} />, path: '/news' },
        { title: 'Explore', icon: <BookOpen size={20} />, path: '/explore' },
        { title: 'Quiz', icon: <HelpCircle size={20} />, path: '/quiz' },
        { title: 'Features', icon: <Settings size={20} />, path: '/features' },
        { title: 'About', icon: <HelpCircle size={20} />, path: '/about' },
    ];

    return (
        <>
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    zIndex: 1000,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isSidebarOpen ? 'transparent' : '#8A2BE2',
                    color: isSidebarOpen ? '#000' : '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                {isSidebarOpen ? <Menu size={24} /> : (
                    <>
                        <Menu size={24} />
                        <span style={{ 
                            backgroundColor: '#8A2BE2', 
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '20px',
                            whiteSpace: 'nowrap'
                        }}>
                            Get Yearly subscription @ ₹1 per day
                        </span>
                    </>
                )}
            </button>

            <div style={{
                width: '250px',
                height: '100vh',
                backgroundColor: 'white',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: isSidebarOpen ? 0 : '-250px',
                top: 0,
                transition: 'left 0.3s ease',
                boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                zIndex: 999,
                overflowY: 'auto'
            }}>
                <img 
                    src={Logo} 
                    alt="Enliten Academy" 
                    style={{ 
                        width: '150px',
                        marginBottom: '40px' 
                    }} 
                />
                
                <div style={{ flex: 1 }}>
                    <p style={{ color: '#666', fontSize: '12px', marginBottom: '10px' }}>overview</p>
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 15px',
                                marginBottom: '5px',
                                textDecoration: 'none',
                                color: isActive(item.path) ? '#8A2BE2' : '#666',
                                backgroundColor: isActive(item.path) ? '#f8f0ff' : 'transparent',
                                borderRadius: '10px',
                                fontSize: '14px'
                            }}
                        >
                            <span style={{ marginRight: '10px' }}>{item.icon}</span>
                            {item.title}
                        </Link>
                    ))}
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <p style={{ color: '#666', fontSize: '12px', marginBottom: '10px' }}>SETTINGS</p>
                    <Link
                        to="/settings"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 15px',
                            textDecoration: 'none',
                            color: '#666',
                            borderRadius: '10px',
                            fontSize: '14px'
                        }}
                    >
                        <Settings size={20} style={{ marginRight: '10px' }} />
                        Setting
                    </Link>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 15px',
                            width: '100%',
                            border: 'none',
                            background: 'none',
                            color: '#ff4444',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        <LogOut size={20} style={{ marginRight: '10px' }} />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
} 