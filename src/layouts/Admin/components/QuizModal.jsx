import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const QuizModal = ({ open = true, onClose, onSubmit, editData = null }) => {
  const [formData, setFormData] = useState(editData || {
    group: '',
    category: '',
    subcategory: '',
    topic: '',
    subtopics: ['']
  });

  const groups = ['Group1', 'Group2', 'Group3', 'Group4'];
  const categories = [
    'General Science',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'Polity',
    'Economics'
  ];

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubtopicChange = (index, value) => {
    const newSubtopics = [...formData.subtopics];
    newSubtopics[index] = value;
    setFormData(prev => ({
      ...prev,
      subtopics: newSubtopics
    }));
  };

  const addSubtopic = () => {
    setFormData(prev => ({
      ...prev,
      subtopics: [...prev.subtopics, '']
    }));
  };

  const removeSubtopic = (index) => {
    setFormData(prev => ({
      ...prev,
      subtopics: prev.subtopics.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.group || !formData.category || !formData.topic || formData.subtopics.some(st => !st.trim())) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
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
        {editData ? 'Edit Quiz' : 'Add New Quiz'}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Group</InputLabel>
            <Select
              value={formData.group}
              onChange={handleChange('group')}
              label="Group"
            >
              {groups.map(group => (
                <MenuItem key={group} value={group}>{group}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={handleChange('category')}
              label="Category"
            >
              {categories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TextField
          fullWidth
          label="Subcategory"
          value={formData.subcategory}
          onChange={handleChange('subcategory')}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Topic"
          value={formData.topic}
          onChange={handleChange('topic')}
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
                  formData.subtopics.length > 1 && (
                    <IconButton 
                      edge="end" 
                      onClick={() => removeSubtopic(index)}
                      sx={{ color: '#d32f2f' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )
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
            onClick={addSubtopic}
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
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(106, 27, 154, 0.1)' }}>
        <Button onClick={onClose} sx={{ color: '#666' }}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: '#6A1B9A',
            '&:hover': {
              bgcolor: '#4A148C'
            }
          }}
        >
          {editData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuizModal;
