import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, BookOpen, MessageSquare, Globe, HelpCircle, LogOut } from 'react-feather';
import Logo from '../assets/logo/logo.png';

export default function Sidebar() {
    const location = useLocation();
    
    const isActive = (path) => {
        return location.pathname === path;
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
        <div style={{
            width: '250px',
            height: '100vh',
            backgroundColor: 'white',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0,
        }}>
            <img src={Logo} alt="Enliten Academy" style={{ height: '40px', marginBottom: '40px' }} />
            
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
                    onClick={() => {/* Add logout logic */}}
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
    );
} 