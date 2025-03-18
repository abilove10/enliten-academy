import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const syllabusData = [
  {
    topic: "General Science",
    subtopics: [
      "Scientific Knowledge and Scientific Temper",
      "Power of Reasoning",
      "Rote Learning Vs Conceptual Learning",
      "Science as a tool to understand the past, present, and future",
    ],
  },
  {
    topic: "Physics",
    subtopics: [
      "Nature of Universe",
      "General Scientific Laws",
      "Mechanics",
      "Properties of Matter",
      "Force",
      "Motion and Energy",
      "Everyday application of the basic principles of Mechanics",
      "Electricity",
      "Magnetism",
      "Light",
      "Sound",
      "Heat",
      "Nuclear Physics in our daily life",
      "Laser",
      "Electronics and Communications",
    ],
  },
  {
    topic: "Chemistry",
    subtopics: [
      "Elements and Compounds",
      "Acids, Base and Salts",
      "Petroleum Products",
      "Fertilizers and Pesticides",
    ],
  },
  {
    topic: "Botany & Zoology",
    subtopics: [
      "Main Concepts of Life Science",
      "Classification of Living Organism",
      "Evolution",
      "Genetics",
      "Physiology",
      "Nutrition",
      "Health and Hygiene",
      "Human Diseases",
      "Environment and Ecology",
    ],
  },
  {
    topic: "Geography",
    subtopics: [
      "Location",
      "Physical Features",
      "Monsoon, Rainfall, Weather and Climate",
      "Water Resources",
      "Rivers in India",
      "Soil, Minerals and Natural Resources",
      "Forest and Wildlife",
      "Agricultural Pattern",
      "Transport and Communication",
      "Social Geography",
      "Population Density and Distribution",
      "Racial, linguistic groups and major tribes",
      "Natural Calamity",
      "Disaster Management",
      "Environmental Pollution: Reasons and preventive measures",
      "Climate Change",
      "Green Energy",
    ],
  },
  {
    topic: "Indian Economy",
    subtopics: [
      "Nature of Indian Economy",
      "Five Year Plan Models - An Assessment",
      "Planning Commission and Niti Ayog",
      "Sources of revenue",
      "Reserve Bank of India",
      "Fiscal Policy and Monetary Policy",
      "Finance Commission",
      "Resource sharing between Union and State Governments",
      "Goods and Services Tax",
      "Structure of Indian Economy and Employment Generation",
      "Land reforms and Agriculture",
      "Application of Science and Technology in agriculture",
      "Industrial growth",
      "Rural welfare oriented programmes",
      "Social problems - Population, education, health, employment, poverty",
    ],
  },
];

function CollapsibleTable(group) {
  const [openRows, setOpenRows] = useState({});
  const handleRowClick = (index) => {
    setOpenRows((prevOpenRows) => ({
      ...prevOpenRows,
      [index]: !prevOpenRows[index],
    }));
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 0 }}>
      <Card
        sx={{
          width: "90%",
          // backgroundColor: "#F3E5F5",
          borderRadius: 3,
          // boxShadow: 3,
          padding: 2,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          align="center"
          sx={{ padding: 2, color: "#6A1B9A" }}
        >
          TNPSC Group {group.group} Syllabus
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#E1BEE7" }}>
                <TableCell />
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: 18,
                    textTransform: "uppercase",
                    color: "#4A148C",
                  }}
                >
                  Topics
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {syllabusData.map((item, index) => (
                <React.Fragment key={index}>
                  <TableRow
                    sx={{
                      "&:hover": { backgroundColor: "#FCF6FF" },
                      transition: "0.3s",
                      cursor: "pointer",
                    }}
                  >
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleRowClick(index)}
                      >
                        {openRows[index] ? (
                          <KeyboardArrowUp sx={{ color: "#6A1B9A" }} />
                        ) : (
                          <KeyboardArrowDown sx={{ color: "#6A1B9A" }} />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ fontSize: 16, fontWeight: "bold" }}>
                      {item.topic}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={2}>
                      <Collapse in={openRows[index]} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                          <Typography
                            variant="subtitle1"
                            gutterBottom
                            sx={{
                              fontWeight: "bold",
                              color: "#4A148C",
                              ml: 2,
                            }}
                          >
                            Units:
                          </Typography>
                          <Table size="small">
                            <TableBody>
                              {item.subtopics.map((subtopic, subIndex) => (
                                <TableRow key={subIndex}>
                                  <TableCell sx={{ paddingLeft: 4 }}>
                                    {subtopic}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}

export default CollapsibleTable;
