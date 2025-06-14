import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../context/SidebarContext';
import { config } from '../utils/config';
import { CircularProgress, Box, Typography, Button } from '@mui/material';
import { Check, X, ChevronDown, ChevronUp, Share2, ArrowLeft, RotateCcw } from 'react-feather';
import { motion, AnimatePresence } from 'framer-motion';

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#F8F2FF',
  },
  mainContent: {
    flexGrow: 1,
    padding: '30px',
    transition: 'width 0.3s ease',
    overflowY: 'auto',
  },
  quizContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  gradientHeader: {
    textAlign: 'center',
    fontSize: '2.5rem',
    fontWeight: 900,
    background: 'linear-gradient(90deg, #B57EDC, #6A1B9A 60%, #9C27B0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '2rem',
    letterSpacing: '-1px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)',
  },
  primaryButton: {
    background: 'linear-gradient(90deg, #B57EDC, #9C27B0)',
    color: 'white',
    padding: '12px 32px',
    border: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 700,
    boxShadow: '0 2px 12px 0 #b57edc22',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  secondaryButton: {
    background: 'white',
    color: '#B57EDC',
    padding: '12px 32px',
    border: '2px solid #B57EDC',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};

const QuizTest = () => {
  const optionLabels = ['A', 'B', 'C', 'D'];
  const [shareCopied, setShareCopied] = useState(false);

  const { isSidebarOpen } = useSidebar();
  const isMobile = window.innerWidth <= 768;
  const [contentWidth, setContentWidth] = useState('100%');

  const location = useLocation();
  const navigate = useNavigate();
  const { group, category, subcategory } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const updateContentWidth = () => {
      if (isMobile) {
        setContentWidth('100%');
      } else {
        setContentWidth(isSidebarOpen ? 'calc(100% - 250px)' : '100%');
      }
    };
    updateContentWidth();
    window.addEventListener('resize', updateContentWidth);
    return () => window.removeEventListener('resize', updateContentWidth);
  }, [isSidebarOpen, isMobile]);

  useEffect(() => {
    if (!group || !category || !subcategory) {
      navigate('/quiz');
      return;
    }
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        let groupNum = group;
        if (typeof group === 'string' && group.startsWith('Group ')) {
          groupNum = parseInt(group.replace('Group ', ''), 10);
        }
        if (typeof groupNum === 'string') {
          groupNum = parseInt(groupNum, 10);
        }
        const response = await fetch(`${config.API_URL}/api/quiz/questions?group=${groupNum}&category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`);
        const res = await response.json();
        if (res && res.questions && res.questions.length > 0) {
          setQuestions(res.questions);
          setAnswers(Array(res.questions.length).fill(null));
        } else {
          setError('No questions found for this topic.');
        }
      } catch (e) {
        setError('Failed to fetch questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [group, category, subcategory, navigate]);

  const handleOption = (optionKey) => {
    if (showResult) return;
    const updated = [...answers];
    updated[current] = optionKey;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handleRestart = () => {
    setShowResult(false);
    setCurrent(0);
    setAnswers(Array(questions.length).fill(null));
  };

  const handleShare = () => {
    const text = `I scored ${score} out of ${questions.length} on the quiz! Try to beat me on Enliten Academy 🚀`;
    navigator.clipboard.writeText(text);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const score = questions.reduce((acc, q, idx) => {
    return acc + (answers[idx] === q.correctOption ? 1 : 0);
  }, 0);

  const getOptionStyle = (optionKey) => {
    const isSelected = answers[current] === optionKey;
    const isCorrect = showResult && optionKey === questions[current]?.correctOption;
    const isWrong = showResult && answers[current] === optionKey && !isCorrect;

    let baseStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      fontSize: 16,
      fontWeight: 500,
      padding: '16px 20px',
      marginBottom: 16,
      borderRadius: '12px',
      border: '2px solid #e0e0e0',
      background: 'white',
      color: '#333',
      cursor: showResult ? 'default' : 'pointer',
      transition: 'all 0.2s ease-in-out',
      transform: 'scale(1)',
    };

    if (isSelected) {
      baseStyle.border = '2px solid #B57EDC';
      baseStyle.background = '#F8F2FF';
      baseStyle.transform = 'scale(1.02)';
    }

    if (isCorrect) {
      baseStyle.border = '2px solid #18ED00';
      baseStyle.background = '#F1FDF0';
      baseStyle.color = '#006400';
    }

    if (isWrong) {
      baseStyle.border = '2px solid #ED0800';
      baseStyle.background = '#FFF2F2';
      baseStyle.color = '#C53030';
    }

    return baseStyle;
  };

  const getOptionLabelStyle = (optionKey) => {
    const isSelected = answers[current] === optionKey;
    const isCorrect = showResult && optionKey === questions[current]?.correctOption;
    const isWrong = showResult && answers[current] === optionKey && !isCorrect;

    let baseStyle = {
      width: 32,
      height: 32,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1rem',
      fontWeight: 700,
      background: '#F0E7F9',
      color: '#9500FF',
      transition: 'all 0.2s ease-in-out',
    };

    if (isSelected) {
      baseStyle.background = '#B57EDC';
      baseStyle.color = 'white';
    }

    if (isCorrect) {
      baseStyle.background = '#18ED00';
      baseStyle.color = 'white';
    }

    if (isWrong) {
      baseStyle.background = '#ED0800';
      baseStyle.color = 'white';
    }

    return baseStyle;
  };
  // console.log(questions)

  const renderQuizContent = () => (
    <div style={styles.card}>
      <Typography sx={{ fontWeight: 600, mb: 1, color: '#666' }}>
        Question {current + 1} of {questions.length}
      </Typography>
      <Box sx={{ height: '8px', width: '100%', backgroundColor: '#EEE', borderRadius: '4px', mb: 3 }}>
        <motion.div
          style={{ height: '100%', background: 'linear-gradient(90deg,#b57edc,#e8cbfb)', borderRadius: '4px' }}
          initial={{ width: 0 }}
          animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </Box>
      <Typography sx={{ mb: 3, fontSize: '1.25rem', fontWeight: 600, color: '#333' }}>
        {questions[current].text}
      </Typography>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          {questions[current].options && Object.entries(questions[current].options).map(([key, value]) => (
            <motion.div
              key={key}
              onClick={() => handleOption(key)}
              style={getOptionStyle(key)}
              whileHover={!showResult ? { scale: 1.02, boxShadow: '0 4px_20px rgba(0,0,0,0.08)' } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
            >
              <div style={getOptionLabelStyle(key)}>{optionLabels[Object.keys(questions[current].options).indexOf(key)]}</div>
              <div>{value}</div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handlePrev}
          disabled={current === 0}
          style={{ ...styles.secondaryButton, opacity: current === 0 ? 0.5 : 1, padding: '10px 24px' }}
        >
          Previous
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          disabled={!answers[current]}
          style={{ ...styles.primaryButton, opacity: !answers[current] ? 0.5 : 1, padding: '10px 24px' }}
        >
          {current === questions.length - 1 ? 'Submit' : 'Next'}
        </motion.button>
      </div>
    </div>
  );

  const renderResultContent = () => (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={styles.card}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, background: 'linear-gradient(90deg,#B57EDC,#9C27B0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Quiz Completed!
        </Typography>
        <Typography variant="h5" sx={{ color: '#555', mb: 3 }}>
          Your final score is:
        </Typography>
        <Typography variant="h2" sx={{ fontWeight: 900, color: '#18ED00', mb: 4 }}>
          {score} / {questions.length}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleRestart} style={styles.primaryButton}>
            <RotateCcw size={18} /> Retake Quiz
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/quiz')} style={styles.secondaryButton}>
            <ArrowLeft size={18} /> Back to Categories
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleShare} style={{ ...styles.secondaryButton, background: shareCopied ? '#18ED00' : 'white', color: shareCopied ? 'white' : '#B57EDC' }} disabled={shareCopied}>
            <Share2 size={18} /> {shareCopied ? 'Copied!' : 'Share Score'}
          </motion.button>
        </Box>
      </Box>
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Review Answers:</Typography>
        {questions.map((q, idx) => (
          <Box key={q.id || idx} sx={{ mb: 2, background: '#F8F9FA', borderRadius: '12px', p: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 1 }}>
              Q{idx + 1}: {q.text || q.question}
            </Typography>
            <Typography sx={{ color: answers[idx] === q.correctOption ? '#18ED00' : '#ED0800', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              Your Answer: {q.options && answers[idx] ? q.options[answers[idx]] : 'Not answered'}
              {answers[idx] === q.correctOption ? <Check size={18} /> : <X size={18} />}
            </Typography>
            {answers[idx] !== q.correctOption && q.correctOption !== undefined && (
              <Typography sx={{ color: '#333', fontWeight: 500, mb: 1 }}>
                Correct Answer: <span style={{ color: '#B57EDC', fontWeight: 700 }}>{q.options && q.options[q.correctOption]}</span>
              </Typography>
            )}
            {q.explanation && (
              <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#EEE', borderRadius: '8px', fontSize: 14, color: '#666' }}>
                <b>Explanation:</b> {q.explanation}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </motion.div>
  );

  return (
    <div style={{...styles.page,
      paddingTop: '4rem',
      width: contentWidth,
      marginLeft: isSidebarOpen && window.innerWidth > 768 ? '300px' : '0'}}>
      <Sidebar />
      <main style={{ ...styles.mainContent, width: contentWidth }}>
        <div style={styles.quizContainer}>
          <h1 style={{...styles.gradientHeader,fontSize: isMobile ? '1.5rem' : '2.5rem',marginBottom: isMobile ? '2rem' : '6rem'}}>{`${category} - ${subcategory}`}</h1>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
              <CircularProgress color="secondary" size={60} />
            </Box>
          ) : error ? (
            <Typography color="error" align="center" sx={{ mt: 8 }}>{error}</Typography>
          ) : showResult ? (
            renderResultContent()
          ) : (
            questions.length > 0 && renderQuizContent()
          )}
        </div>
      </main>
    </div>
  );
};

export default QuizTest;
