import React, { useState, useEffect } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Paper,
  Dialog,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import QuizEditDialog from './QuizEditDialog';
import { config } from '../../../utils/config';

const QuizManager = () => {
  const [quizData, setQuizData] = useState({});
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, []);

  const fetchQuizData = async () => {
    try {
      const adminKey = localStorage.getItem('adminKey');
      const response = await fetch(`${config.API_URL}/api/admin/quiz`, {
        headers: {
          'Authorization': `Bearer ${adminKey}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch quiz data');
      }
      
      const data = await response.json();
      console.log('Raw quiz data:', data); // Debug log
      
      if (!data.quiz || Object.keys(data.quiz).length === 0) {
        console.warn('Quiz data is empty'); // Debug warning
      }
      
      setQuizData(data.quiz || {});
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (group, category, subcategory, data) => {
    setSelectedQuiz({
      group,
      category,
      subcategory,
      ...data
    });
    setEditDialog(true);
  };

  const handleDelete = async (group, category, subcategory) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        const adminKey = localStorage.getItem('adminKey');
        await fetch(
          `${config.API_URL}/api/admin/quiz/${group}/${category}/${subcategory}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${adminKey}`,
            },
          }
        );
        fetchQuizData();
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {loading ? (
        <Typography>Loading quiz data...</Typography>
      ) : Object.keys(quizData).length === 0 ? (
        <Typography>No quiz data available</Typography>
      ) : (
        Object.entries(quizData).map(([group, categories]) => (
          <Accordion key={group} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{group}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {Object.entries(categories || {}).map(([category, subcategories]) => (
                  <Grid item xs={12} key={category}>
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>{category}</Typography>
                      <Grid container spacing={2}>
                        {Object.entries(subcategories || {}).map(([subcategory, data]) => (
                          <Grid item xs={12} md={6} key={subcategory}>
                            <Paper
                              component={motion.div}
                              whileHover={{ scale: 1.01 }}
                              sx={{ 
                                p: 2,
                                bgcolor: '#f5f5f5',
                                border: '1px solid #e0e0e0'
                              }}
                            >
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start',
                                mb: 1
                              }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                  {data.topic || subcategory}
                                </Typography>
                                <Box>
                                  <IconButton
                                    onClick={() => handleEdit(group, category, subcategory, data)}
                                    size="small"
                                    color="primary"
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                    onClick={() => handleDelete(group, category, subcategory)}
                                    size="small"
                                    color="error"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                              </Box>
                              {data.subtopics && data.subtopics.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="caption" color="textSecondary">
                                    Subtopics:
                                  </Typography>
                                  <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                                    {data.subtopics.map((subtopic, index) => (
                                      <li key={index}>
                                        <Typography variant="body2">{subtopic}</Typography>
                                      </li>
                                    ))}
                                  </ul>
                                </Box>
                              )}
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      <QuizEditDialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        quiz={selectedQuiz}
        onSave={async (updatedData) => {
          try {
            const adminKey = localStorage.getItem('adminKey');
            await fetch(
              `${config.API_URL}/api/admin/quiz/${selectedQuiz.group}/${selectedQuiz.category}/${selectedQuiz.subcategory}`,
              {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${adminKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
              }
            );
            fetchQuizData();
            setEditDialog(false);
          } catch (error) {
            console.error('Error updating quiz:', error);
          }
        }}
      />
    </Box>
  );
};

export default QuizManager;
