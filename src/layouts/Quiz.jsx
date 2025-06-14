import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../context/SidebarContext';
import CollapsibleTable from "../components/CollapsibleTable";
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { config } from '../utils/config';
import { js } from '@eslint/js';

export default function Quiz(props) {
    const [Active, setActive] = useState(1);
    const [contentWidth, setContentWidth] = useState('100%');
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { isSidebarOpen } = useSidebar();

    const isMobile = () => { 
        return /Mobi|Android/i.test(navigator.userAgent); 
    }; 
       
    const mobile = isMobile(); 

    const fetchQuizCategories = async (group) => {
        setLoading(true);
        try {
            const data = await api.fetchQuizCategories(group);
            // Transform the nested object structure to a flat array of subcategories for CollapsibleTable
            // data: { [category]: [ {id, topic, subtopics...}, ... ] }
            let quizList = [];
            if (data && typeof data === 'object') {
                Object.entries(data).forEach(([category, subcategories]) => {
                    if (Array.isArray(subcategories)) {
                        // Already in array format
                        quizList = quizList.concat(subcategories);
                    } else if (typeof subcategories === 'object' && subcategories !== null) {
                        // Firestore admin API returns {subcategoryId: {topic, subtopics...}}
                        Object.entries(subcategories).forEach(([subcatId, subcatData]) => {
                            quizList.push({
                                ...subcatData,
                                id: subcatId,
                                category
                            });
                        });
                    }
                });
            }
            setQuizData(quizList);
        } catch (error) {
            console.error("Error fetching quiz categories:", error);
            setQuizData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const updateContentWidth = () => {
            const sidebarWidth = 300; // Width of sidebar, adjust as needed
            const windowWidth = window.innerWidth;

            if (windowWidth <= 768) {
                setContentWidth('100%');
            } else {
                setContentWidth(isSidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%');
            }
        };

        updateContentWidth();
        window.addEventListener('resize', updateContentWidth);
        return () => window.removeEventListener('resize', updateContentWidth);
    }, [isSidebarOpen]);

    useEffect(() => {
        fetchQuizCategories(Active);
    }, [Active]);

    return (
        <>
            <Sidebar />
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{ 
                    marginLeft: isSidebarOpen && window.innerWidth > 768 ? '300px' : '0',
                    backgroundColor: "#fcfaff",
                    width: contentWidth,
                    minHeight: '100vh',
                    paddingTop: '80px',
                    paddingBottom: '40px',
                    overflowY: "auto"
                }}
            >
                <motion.div
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 style={{
                        textAlign: 'center',
                        fontSize: mobile ? '24px' : '32px',
                        fontWeight: '600',
                        background: 'linear-gradient(45deg, #6A1B9A, #9C27B0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        TNPSC Quiz Categories
                    </h1>
                    <p style={{
                        textAlign: 'center',
                        color: '#666',
                        marginBottom: '40px',
                        fontSize: mobile ? '14px' : '16px'
                    }}>
                        Select a category and topic to start practicing
                    </p>
                </motion.div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ 
                        width: mobile ? '90%' : '50%',
                        display: 'flex',
                        fontSize: mobile ? '14px' : '16px',
                        justifyContent: 'space-between',
                        backgroundColor: 'white',
                        padding: '8px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    }}>
                        {["Group 1", "Group 2", "Group 3", "Group 4"].map((group, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActive(index + 1)}
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: Active === index + 1 ? '#f0e6ff' : 'white',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    flex: 1,
                                    textAlign: 'center',
                                    margin: '0 4px',
                                    color: Active === index + 1 ? '#6A1B9A' : '#666',
                                    fontWeight: Active === index + 1 ? '600' : '400',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {group}
                            </motion.div>
                        ))}
                    </div>
                </div>

                <motion.div 
                    style={{marginTop:'40px'}}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <CollapsibleTable 
                        group={Active} 
                        quizData={quizData} 
                        loading={loading} 
                    />
                </motion.div>
            </motion.div>
        </>
    );
}
