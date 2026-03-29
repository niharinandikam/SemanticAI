import React, { useMemo } from "react";
import { Box, Typography, Card, CardContent, Container, Divider } from "@mui/material";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { PieChart, Pie, ResponsiveContainer } from "recharts";

const QUOTE_LIBRARY = {
  low: [
    "Integrity at its finest! Your original thought shines through.",
    "Your unique voice is your greatest strength. Keep it up!",
    "Exceptional work! You've mastered the art of independent thought.",
    "Authenticity is the soul of great writing. Well done!",
    "A breath of fresh air! Your content is remarkably original.",
    "Pure originality! You have a clear and distinct perspective.",
    "Great job maintaining academic honesty in this document.",
    "Your writing reflects a deep and personal understanding of the topic.",
    "Outstanding! This is a textbook example of original work.",
    "Excellence in every word! Your creative spark is evident here."
  ],
  moderate: [
    "Good start! A few more citations will make this work rock solid.",
    "Strong effort! Fine-tune your references to elevate this piece.",
    "Solid content! Remember that proper attribution builds credibility.",
    "Almost there! Just a few sections need your unique personal touch.",
    "Good work, but be sure to paraphrase more effectively in matched areas.",
    "A solid draft! Strengthening your citations will perfect it.",
    "Well structured! Adding more of your own analysis will balance the sources.",
    "Steady progress! Ensure all borrowed ideas are clearly credited.",
    "You have a good flow; just polish the quoted segments for better clarity.",
    "A respectable effort! Focus on synthesizing your sources more deeply."
  ],
  high: [
    "Your ideas are worth sharing—try expressing them in your own words.",
    "Use these matches as a helpful guide to rewrite your narrative.",
    "Focus on synthesizing facts into your own unique framework.",
    "A bit too much borrowing—let's see more of 'YOU' in this draft.",
    "Try to step back and explain these concepts from your own memory.",
    "Your voice is getting lost among your sources; let's bring it back.",
    "Great research! Now, transform those findings into your own language.",
    "Significant overlap detected. This is a great chance to refine your style.",
    "Challenge yourself to summarize these external ideas without looking at them.",
    "You have the data; now give us your unique interpretation of it."
  ],
  critical: [
    "Mistakes are portals of discovery. Let's try a fresh, new start!",
    "Honest work is the most rewarding. Let's aim for 100% you next time.",
    "Let your own voice be the hero of your next revision.",
    "Revising this is a great chance to really master the material deeply.",
    "Don't be discouraged—use this report as a map to find your own voice.",
    "Writing is a journey. Let's take a different path for this section.",
    "True learning happens when you put ideas into your own words.",
    "You have the potential! Let's strip away the noise and hear your thoughts.",
    "A fresh draft will help you internalize these concepts much better.",
    "This is a learning moment. Let's rebuild this content from the ground up."
  ]
};

export default function Results() {
  const location = useLocation();
  
  // Data passed from the Upload.jsx or History.jsx navigate call
  const rawText = location.state?.text || "No content available.";
  const plagiarismPercent = location.state?.score ?? 0;
  const analysis = location.state?.analysis || []; 
  const aiInsight = location.state?.ai_insight || "Our AI engine is still calculating deeper insights for this document.";

  const feedback = useMemo(() => {
    let category = "critical";
    if (plagiarismPercent <= 10) {
      category = "low";
    } else if (plagiarismPercent <= 40) {
      category = "moderate";
    } else if (plagiarismPercent <= 70) {
      category = "high";
    }

    const quotes = QUOTE_LIBRARY[category];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, [plagiarismPercent]);

  const chartData = [
    { name: "Plagiarized", value: plagiarismPercent, fill: "#3b82f6" }, 
    { name: "Original", value: 100 - plagiarismPercent, fill: "#1e293b" }
  ];

  const highlightedAnalysis = useMemo(() => {
    const seen = new Map();

    return analysis.map((item) => {
      const baseKey = `${item.text}-${String(item.isPlagiarized)}`;
      const count = (seen.get(baseKey) || 0) + 1;
      seen.set(baseKey, count);

      return {
        ...item,
        key: `${baseKey}-${count}`,
      };
    });
  }, [analysis]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", backgroundColor: "#000000", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <Box component="main" sx={{ 
        flexGrow: 1, 
        overflowY: "auto", 
        py: { xs: 4, md: 6 },
        "&::-webkit-scrollbar": { width: "8px" },
        "&::-webkit-scrollbar-track": { background: "#000" },
        "&::-webkit-scrollbar-thumb": { background: "#1e293b", borderRadius: "10px" } 
      }}>
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight="800" sx={{ mb: 4, textAlign: "center", background: "linear-gradient(90deg, #ffffff, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Poppins', sans-serif", fontSize: { xs: "2rem", md: "3rem" } }}>
            Analysis Report
          </Typography>

          {/* Stats Card */}
          <Card sx={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 5, color: "white", mb: 4 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-around", flexWrap: "wrap", gap: { xs: 3, md: 4 }, py: { xs: 3.5, md: 5 } }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Similarity Score</Typography>
                <Typography variant="h2" sx={{ color: "#60a5fa", fontWeight: "900", fontFamily: "'Poppins', sans-serif", fontSize: { xs: "2.4rem", md: "3.75rem" } }}>{plagiarismPercent}%</Typography>
              </Box>
              <Box sx={{ height: 140, width: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} innerRadius={40} outerRadius={55} paddingAngle={8} dataKey="value" stroke="none" />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 500, color: "#f8fafc", fontStyle: "italic", maxWidth: { xs: "100%", md: "250px" }, textAlign: "center" }}>"{feedback}"</Typography>
            </CardContent>
          </Card>

          {/* AI Semantic Insight Box */}
          <Card sx={{ backgroundColor: "#1e293b", border: "1px solid #3b82f6", borderRadius: 5, color: "white", mb: 4, p: { xs: 2.5, md: 4 }, boxShadow: "0 0 20px rgba(59, 130, 246, 0.15)" }}>
            <Typography variant="h6" sx={{ color: "#60a5fa", fontWeight: "800", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
              ✨ AI Semantic Insight
            </Typography>
            <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 2 }} />
            <Typography variant="body1" sx={{ lineHeight: 1.8, color: "#cbd5e1", fontSize: "1rem" }}>
              {aiInsight}
            </Typography>
          </Card>

          {/* Highlighted Document Box */}
          <Card sx={{ borderRadius: 5, backgroundColor: "#ffffff", overflow: "hidden", mb: 6 }}>
            <Box sx={{ p: 3, borderBottom: "1px solid #e2e8f0", textAlign: "center", backgroundColor: "#f8fafc" }}>
              <Typography variant="h6" fontWeight="800" sx={{ color: "#0f172a", fontFamily: "'Poppins', sans-serif" }}>Document Content Analysis</Typography>
            </Box>
            <Box sx={{ p: { xs: 3, md: 5 }, color: "#1e293b", lineHeight: 2, fontSize: { xs: "1rem", md: "1.1rem" }, textAlign: "justify" }}>
              {highlightedAnalysis.length > 0 ? highlightedAnalysis.map((item) => (
                <span key={item.key} style={{ 
                    backgroundColor: item.isPlagiarized ? "#fff3bf" : "transparent", 
                    borderBottom: item.isPlagiarized ? "2px solid #fab005" : "none", 
                    padding: "2px 0" 
                }}>
                  {item.text}{" "}
                </span>
              )) : <Typography sx={{ whiteSpace: "pre-wrap" }}>{rawText}</Typography>}
            </Box>
          </Card>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}