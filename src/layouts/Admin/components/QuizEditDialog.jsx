import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  List,
  ListItem,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const QuizEditDialog = ({ open, onClose, quiz, onSave }) => {
  const [formData, setFormData] = useState({
    topic: '',
    subtopics: [],
  });

  useEffect(() => {
    if (quiz) {
      setFormData({
        topic: quiz.topic || '',
        subtopics: quiz.subtopics || [],
      });
    }
  }, [quiz]);

  const handleAddSubtopic = () => {
    setFormData(prev => ({
      ...prev,
      subtopics: [...prev.subtopics, ''],
    }));
  };

  const handleSubtopicChange = (index, value) => {
    const newSubtopics = [...formData.subtopics];
    newSubtopics[index] = value;
    setFormData(prev => ({
      ...prev,
      subtopics: newSubtopics,
    }));
  };

  const handleDeleteSubtopic = (index) => {
    setFormData(prev => ({
      ...prev,
      subtopics: prev.subtopics.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(106, 27, 154, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, rgba(106, 27, 154, 0.05), rgba(156, 39, 176, 0.05))',
        borderBottom: '1px solid rgba(106, 27, 154, 0.1)'
      }}>
        {quiz ? 'Edit Quiz' : 'Add Quiz'}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Topic"
            value={formData.topic}
            onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, color: '#6A1B9A' }}>
              Subtopics
            </Typography>
            <List>
              {formData.subtopics.map((subtopic, index) => (
                <ListItem
                  key={index}
                  sx={{
                    border: '1px solid rgba(106, 27, 154, 0.1)',
                    borderRadius: 1,
                    mb: 1,
                  }}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      onClick={() => handleDeleteSubtopic(index)}
                      sx={{ color: '#d32f2f' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <TextField
                    fullWidth
                    placeholder={`Subtopic ${index + 1}`}
                    value={subtopic}
                    onChange={(e) => handleSubtopicChange(index, e.target.value)}
                    variant="standard"
                    sx={{ mr: 2 }}
                  />
                </ListItem>
              ))}
            </List>
            
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddSubtopic}
              sx={{ 
                mt: 1,
                color: '#6A1B9A',
                '&:hover': {
                  backgroundColor: 'rgba(106, 27, 154, 0.08)'
                }
              }}
            >
              Add Subtopic
            </Button>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(106, 27, 154, 0.1)' }}>
        <Button onClick={onClose} sx={{ color: '#666' }}>
          Cancel
        </Button>
        <Button 
          onClick={() => onSave(formData)}
          variant="contained"
          sx={{
            bgcolor: '#6A1B9A',
            '&:hover': {
              bgcolor: '#4A148C'
            }
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuizEditDialog;
