import React from "react";
import { Box, Typography, Container, Grid, Card, CardContent, Divider, Button } from "@mui/material";
import { AutoGraph, Psychology, Storage, Security, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function About() {
  const navigate = useNavigate();

  const details = [
    {
      title: "Semantic Understanding",
      icon: <Psychology fontSize="large" sx={{ color: "#60a5fa" }} />,
      text: "Unlike traditional tools that look for exact word matches, our engine uses 'Sentence Transformers' to understand the meaning. Even if a student rewrites a sentence using synonyms, our AI detects the underlying similarity."
    },
    {
      title: "Neural Network Verification",
      icon: <AutoGraph fontSize="large" sx={{ color: "#3b82f6" }} />,
      text: "We use a pre-trained LLM (All-MiniLM) to convert text into high-dimensional vectors. We then calculate the 'Cosine Similarity' between vectors to ensure academic honesty with mathematical precision."
    },
    {
      title: "Internal Database Logic",
      icon: <Storage fontSize="large" sx={{ color: "#2563eb" }} />,
      text: "Every scan is cross-referenced against your local repository. This prevents students from 'recycling' assignments from previous years or sharing work within the same batch."
    },
    {
      title: "Gemini-Powered Insights",
      icon: <Security fontSize="large" sx={{ color: "#93c5fd" }} />,
      text: "Our system doesn't just give a score; it explains it. Powered by Google Gemini, the system provides a natural language summary of why specific sections were flagged."
    }
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", backgroundColor: "#000" }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, overflowY: "auto", py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate("/")}
            sx={{ color: "#94a3b8", mb: 4, textTransform: "none" }}
          >
            Back to Home
          </Button>

          <Typography variant="h2" fontWeight="900" sx={{ 
            color: "#fff", mb: 2, fontFamily: "'Poppins', sans-serif",
            fontSize: { xs: "2rem", md: "3.75rem" },
            background: "linear-gradient(90deg, #fff, #60a5fa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            Technology Behind the Shield
          </Typography>
          
          <Typography variant="h6" sx={{ color: "#94a3b8", mb: { xs: 5, md: 8 }, maxWidth: "800px", lineHeight: 1.6, fontSize: { xs: "1rem", md: "1.25rem" } }}>
            Our Semantic Plagiarism Detection system moves beyond simple keyword matching to protect 
            the true value of original thought and academic integrity.
          </Typography>

          <Grid container spacing={4}>
            {details.map((item) => (
              <Grid item xs={12} md={6} key={item.title}>
                <Card sx={{ 
                  backgroundColor: "#0f172a", border: "1px solid #1e293b", 
                  borderRadius: 4, height: "100%", transition: "0.3s",
                  "&:hover": { borderColor: "#3b82f6", transform: "translateY(-5px)" }
                }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Box sx={{ mb: 2 }}>{item.icon}</Box>
                    <Typography variant="h5" fontWeight="700" sx={{ color: "#fff", mb: 2, fontFamily: "'Poppins', sans-serif" }}>
                      {item.title}
                    </Typography>
                    <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 2 }} />
                    <Typography variant="body1" sx={{ color: "#94a3b8", lineHeight: 1.8 }}>
                      {item.text}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}