import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Card,
  Chip,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";

import { useNavigate } from 'react-router-dom';

function CollapsibleTable({ group, quizData, loading }) {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 0 }}>
      <Card
        component={motion.div}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        sx={{
          width: "90%",
          maxWidth: "1200px",
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(106, 27, 154, 0.08)",
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          component={motion.h2}
          layout
          fontWeight="bold"
          align="center"
          sx={{
            mb: 4,
            background: "linear-gradient(45deg, #6A1B9A, #9C27B0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          TNPSC Group {group} Syllabus
        </Typography>

        {loading ? (
          <Typography align="center" sx={{ mt: 4 }}>
            Loading quiz details...
          </Typography>
        ) : quizData && Array.isArray(quizData) ? (
          quizData.map((item, index) => (
            <Accordion
              key={index}
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              sx={{
                mb: 2,
                borderRadius: "16px!important",
                overflow: "hidden",
                '&:before': { display: 'none' },
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: '1px solid rgba(106, 27, 154, 0.1)',
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon sx={{ color: "#9C27B0" }} />
                }
                sx={{
                  background: "linear-gradient(45deg, rgba(106, 27, 154, 0.03), rgba(156, 39, 176, 0.03))",
                  '&:hover': {
                    background: "linear-gradient(45deg, rgba(106, 27, 154, 0.06), rgba(156, 39, 176, 0.06))",
                  }
                }}
              >
                <Typography 
                  sx={{ 
                    fontSize: "1.1rem", 
                    fontWeight: "600",
                    color: "#6A1B9A",
                  }}
                >
                  {item.topic || item.id}
                </Typography>
                {item.category && (
                  <Typography sx={{ ml: 2, color: '#888', fontSize: '0.95em' }}>
                    {item.category}
                  </Typography>
                )}
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {item.subtopics && item.subtopics.map((subtopic, subIndex) => (
                    <Grid item xs={12} md={6} key={subIndex}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: subIndex * 0.05 }}
                      >
                        <Card
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid rgba(106, 27, 154, 0.1)',
                            background: 'rgba(106, 27, 154, 0.02)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'rgba(106, 27, 154, 0.05)',
                              transform: 'translateY(-2px)',
                            }
                          }}
                        >
                          <Chip
                            size="small"
                            label={subIndex + 1}
                            sx={{
                              backgroundColor: 'rgba(106, 27, 154, 0.1)',
                              color: '#6A1B9A',
                              fontWeight: '600',
                              minWidth: '32px',
                            }}
                          />
                          <Typography sx={{ color: '#333', flex: 1 }}>
                            {subtopic}
                          </Typography>
                          <button
  style={{
    marginLeft: 8,
    background: '#B57EDC',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '4px 12px',
    cursor: 'pointer',
    fontWeight: 500
  }}
  onClick={() => navigate('/quiz-test', { state: { group, category: item.category || item.topic, subcategory: subtopic } })}
>
  Take Test
</button>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography align="center" sx={{ mt: 4 }}>
            No quiz details available.
          </Typography>
        )}
      </Card>
    </Box>
  );
}

export default CollapsibleTable;
