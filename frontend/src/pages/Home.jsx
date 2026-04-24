import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { VerifiedRounded } from "@mui/icons-material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const humanizeHighlights = [
    {
      title: "Expertly tuned output",
      description:
        "Built for clarity and natural flow, so rewritten text sounds confident, readable, and authentically human.",
    },
    {
      title: "Fast transformation",
      description:
        "Paste your text and get a cleaner, more human-like version in seconds, without breaking your workflow.",
    },
    {
      title: "Always evolving",
      description:
        "Our approach adapts over time, helping your writing stay natural as AI-generated patterns keep changing.",
    },
    {
      title: "Context-sensitive",
      description:
        "Keeps topic intent intact while improving tone, phrasing, and readability for your target audience.",
    },
    {
      title: "Works with your flow",
      description:
        "Humanize and plagiarism analysis live in one place, so you can refine content and verify originality together.",
    },
  ];

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

        {/* --- HUMANIZER BENEFITS SECTION --- */}
        <Box
          sx={{
            background: "linear-gradient(180deg, #020617 0%, #000000 100%)",
            py: { xs: 8, md: 11 },
            borderTop: "1px solid #1e293b",
            borderBottom: "1px solid #1e293b",
            flexShrink: 0,
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
              <Typography
                variant="h3"
                sx={{
                  background: "linear-gradient(90deg, #ffffff 0%, #60a5fa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 900,
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: { xs: "2rem", md: "3.4rem" },
                  letterSpacing: "-0.02em",
                  mb: 2,
                }}
              >
                Why Use Our AI Humanizer?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#94a3b8",
                  maxWidth: 860,
                  mx: "auto",
                  lineHeight: 1.7,
                  fontSize: { xs: "1rem", md: "1.15rem" },
                }}
              >
                Go beyond simple rewrites. Improve fluency, preserve meaning, and make generated text feel naturally written.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-start",
                gap: { xs: 4, md: 5 },
              }}
            >
              {humanizeHighlights.map((item) => (
                <Box
                  key={item.title}
                  sx={{
                    flex: { xs: "1 1 100%", md: "1 1 calc(50% - 20px)", lg: "1 1 calc(33.333% - 28px)" },
                    minWidth: { xs: "100%", md: 320 },
                  }}
                >
                  <VerifiedRounded sx={{ color: "#60a5fa", fontSize: "2rem", mb: 1.5 }} />
                  <Typography
                    variant="h5"
                    sx={{
                      color: "#e2e8f0",
                      fontWeight: 800,
                      fontSize: { xs: "1.55rem", md: "1.95rem" },
                      lineHeight: 1.2,
                      mb: 1.6,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#94a3b8",
                      lineHeight: 1.6,
                      fontSize: { xs: "1rem", md: "1.12rem" },
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}