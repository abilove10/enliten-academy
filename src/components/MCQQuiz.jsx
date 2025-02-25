import React, { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'react-feather';

const MCQQuiz = ({ questions }) => {
    const [userAnswers, setUserAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [showExplanations, setShowExplanations] = useState({});

    const isMobile = () => { 
        return /Mobi|Android/i.test(navigator.userAgent); 
      }; 
       
      // Usage in a React component 
        const mobile = isMobile(); 
    const optionLabels = ['A', 'B', 'C', 'D'];

    const handleOptionSelect = (questionIndex, option) => {
        if (submitted) return;
        setUserAnswers({
            ...userAnswers,
            [questionIndex]: option
        });
    };

    const toggleExplanation = (questionIndex) => {
        setShowExplanations(prev => ({
            ...prev,
            [questionIndex]: !prev[questionIndex]
        }));
    };

    const handleSubmit = () => {
        let correctAnswers = 0;
        questions.forEach((question, index) => {
            if (userAnswers[index] === question.correctAnswer) {
                correctAnswers++;
            }
        });
        setScore(correctAnswers);
        setSubmitted(true);
    };

    const getOptionStyle = (questionIndex, option) => {
        const baseStyle = {
            padding: '12px 15px',
            borderRadius: '8px',
            cursor: submitted ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            // width: '100%',
            width:isMobile?'100%':'60%',
            marginBottom: '8px',
            transition: 'all 0.2s ease',
            backgroundColor: '#F8F2FF'
        };

        if (!submitted) {
            return {
                ...baseStyle,
                backgroundColor: userAnswers[questionIndex] === option ? '#E8CBFB' : 'white',
                border: userAnswers[questionIndex] === option ? '2px solid #B57EDC' : '1px solid #E0E0E0',
                ':hover': {
                    backgroundColor: '#F8F8F8'
                }
            };
        }

        const question = questions[questionIndex];
        if (option === question.correctAnswer) {
            return {
                ...baseStyle,
                backgroundColor: '#C5FCCA',
                border: '2px solid #18ED00'
            };
        } else if (userAnswers[questionIndex] === option) {
            return {
                ...baseStyle,
                backgroundColor: '#FCCFC5',
                border: '2px solid #ED0800'
            };
        }
        return {
            ...baseStyle,
            backgroundColor: '#F8F2FF',
            border: '1px solid #E0E0E0'
        };
    };

    const getOptionLabelStyle = (questionIndex, option) => {
        const baseStyle = {
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: '#E8CBFB',
            color: '#9500FF'
        };

        if (submitted) {
            const question = questions[questionIndex];
            if (option === question.correctAnswer) {
                return { ...baseStyle, backgroundColor: '#C5FCCA', color: '#18ED00' };
            } else if (userAnswers[questionIndex] === option) {
                return { ...baseStyle, backgroundColor: '#FCCFC5', color: '#ED0800' };
            }
        } else if (userAnswers[questionIndex] === option) {
            return { ...baseStyle, backgroundColor: '#B57EDC', color: 'white' };
        }

        return baseStyle;
    };

    return (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto',paddingBottom:'20px' }}>
            <div style={{ 
                backgroundColor: '#F8F8F8', 
                padding: '15px', 
                borderRadius: '10px',
                marginBottom: '20px',
            }}>
                <pre style={{ 
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '14px'
                }}>
                    {`Here's your quiz! Answer all questions and click submit to see your results.`}
                </pre>
            </div>

            {questions.map((question, questionIndex) => (
                <div key={questionIndex} style={{ marginBottom: '25px' }}>
                    <div style={{ 
                        marginBottom: '12px', 
                        fontSize: '15px', 
                        fontWeight: '500',
                        color: '#333',
                    }}>
                        {questionIndex + 1}. {question.question}
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        {question.options.map((option, optionIndex) => (
                            <div
                                key={optionIndex}
                                onClick={() => handleOptionSelect(questionIndex, option)}
                                style={{...getOptionStyle(questionIndex, option)}}
                            >
                                <div style={{...getOptionLabelStyle(questionIndex, option)}}>
                                    {optionLabels[optionIndex]}
                                </div>
                                <span style={{ flex: 1 }}>{option}</span>
                                {submitted && option === question.correctAnswer && (
                                    <Check color="#18ED00" size={16} />
                                )}
                                {submitted && userAnswers[questionIndex] === option && 
                                 option !== question.correctAnswer && (
                                    <X color="#ED0800" size={16} />
                                )}
                            </div>
                        ))}
                    </div>
                    {submitted && (
                        <div style={{ marginTop: '10px' }}>
                            <div
                                onClick={() => toggleExplanation(questionIndex)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    color: '#B57EDC',
                                    fontSize: '14px',
                                    gap: '5px'
                                }}
                            >
                                {showExplanations[questionIndex] ? 
                                    <ChevronUp size={16} /> : 
                                    <ChevronDown size={16} />
                                }
                                <span>
                                    {showExplanations[questionIndex] ? 
                                        'Hide Explanation' : 
                                        'Show Explanation'
                                    }
                                </span>
                            </div>
                            {showExplanations[questionIndex] && (
                                <div style={{ 
                                    marginTop: '8px',
                                    padding: '10px',
                                    backgroundColor: '#F8F8F8',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    color: '#666'
                                }}>
                                    {question.explanation}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
            
            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    style={{
                        backgroundColor: '#B57EDC',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        width: '100%',
                        marginTop: '10px',
                    }}
                >
                    Submit Quiz
                </button>
            ) : (
                <div style={{ 
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#F0F0F0',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '15px',
                    fontWeight: '500'
                }}>
                    <h3 style={{ margin: 0 }}>Final Score: {score}/{questions.length}</h3>
                </div>
            )}
        </div>
    );
};

export default MCQQuiz; 