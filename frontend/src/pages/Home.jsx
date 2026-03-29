import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const isLoggedIn = localStorage.getItem("userToken");
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100vh", 
      overflow: "hidden", 
      backgroundColor: "#000000",
      fontFamily: "'Inter', sans-serif"
    }}>
      <Header />
      
      {/* Scrollable middle section */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        overflowY: "auto", 
        display: "flex", 
        flexDirection: "column",
        scrollBehavior: "smooth",
        "&::-webkit-scrollbar": { width: "6px" },
        "&::-webkit-scrollbar-track": { background: "#000" },
        "&::-webkit-scrollbar-thumb": { background: "#1e293b", borderRadius: "10px" }
      }}>
        
        {/* --- HERO SECTION --- */}
        <Box sx={{ 
          py: { xs: 8, md: 14 }, 
          minHeight: "45vh", 
          position: 'relative', 
          background: "radial-gradient(circle at center, #0a192f 0%, #000000 80%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0 
        }}>
          <Container maxWidth="lg" sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <Typography variant="h3" fontWeight="800" mb={2} sx={{ 
              background: "linear-gradient(90deg, #ffffff 0%, #60a5fa 100%)",
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent",
              fontFamily: "'Poppins', sans-serif",
              fontSize: { xs: '2.5rem', md: '4rem' },
              letterSpacing: "-0.01em"
            }}>
              Smart AI Semantic Plagiarism Detection
            </Typography>
            <Typography variant="body1" mb={5} sx={{ color: "#94a3b8", px: { md: 12 }, fontSize: "1.1rem", lineHeight: 1.6 }}>
              Beyond simple matching. Our neural networks understand context and meaning to protect your original work.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button variant="contained" onClick={handleGetStarted} sx={{ backgroundColor: "#2563eb", px: { xs: 4, sm: 5 }, py: 1.6, borderRadius: "50px", fontWeight: "800", textTransform: "none", fontSize: "1rem", width: { xs: "100%", sm: "auto" }, maxWidth: 280 }}>Get Started</Button>
            </Box>
          </Container>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}