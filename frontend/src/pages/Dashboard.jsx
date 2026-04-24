import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Card, CardContent, Button, Container, Skeleton } from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { Add, Analytics, BugReport, AssignmentTurnedIn, AutoFixHigh } from "@mui/icons-material";
// --- IMPORT ADDED ---
import { API_BASE_URL } from "../config";

function StatCard({ title, value, icon, color, subtitle, loading }) {
  return (
    <Card sx={{ 
      backgroundColor: "#0f172a", border: "1px solid #1e293b", 
      borderRadius: 5, color: "white", transition: "0.3s",
      "&:hover": { borderColor: color }
    }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {React.cloneElement(icon, { sx: { color: color, mr: 1 } })}
          <Typography variant="subtitle1" sx={{ color: "#94a3b8", fontWeight: "600" }}>{title}</Typography>
        </Box>
        <Typography variant="h2" fontWeight="800" sx={{ color: title === "Total Scans" ? "white" : color, fontFamily: "'Poppins', sans-serif" }}>
          {loading ? <Skeleton width={80} sx={{ bgcolor: "#1e293b", borderRadius: 1 }} /> : value}
        </Typography>
        <Typography variant="caption" sx={{ color: "#64748b" }}>{subtitle}</Typography>
        <Box sx={{ mt: 3, height: "6px", backgroundColor: color, borderRadius: "3px" }} />
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, plagiarized: 0, original: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          navigate("/auth");
          return;
        }

        const cleanToken = token.startsWith('"') ? JSON.parse(token) : token;

        const res = await fetch(`${API_BASE_URL}/history`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${cleanToken.trim()}`,
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          const plag = data.filter(s => s.score > 20).length;
          setStats({
            total: data.length,
            plagiarized: plag,
            original: data.length - plag
          });
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [navigate]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", backgroundColor: "#000000", color: "#ffffff" }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, overflowY: "auto", py: { xs: 5, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: { xs: 5, md: 8 } }}>
            <Typography variant="h3" fontWeight="800" sx={{ background: "linear-gradient(90deg, #ffffff, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", mb: 1.5, fontSize: { xs: "2rem", md: "3rem" } }}>
              Control Center
            </Typography>
            <Typography variant="body1" sx={{ color: "#94a3b8" }}>Manage your history and view real-time integrity metrics.</Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: { xs: 5, md: 8 },
            }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/upload")}
              sx={{
                backgroundColor: "#2563eb",
                borderRadius: "50px",
                px: { xs: 3, md: 5 },
                py: 1.6,
                fontWeight: "bold",
                textTransform: "none",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Start New Analysis
            </Button>

            <Button
              variant="outlined"
              startIcon={<AutoFixHigh />}
              onClick={() => navigate("/humanize")}
              sx={{
                borderColor: "#60a5fa",
                color: "#bfdbfe",
                borderRadius: "50px",
                px: { xs: 3, md: 5 },
                py: 1.6,
                fontWeight: "bold",
                textTransform: "none",
                width: { xs: "100%", sm: "auto" },
                "&:hover": {
                  borderColor: "#93c5fd",
                  backgroundColor: "rgba(59, 130, 246, 0.12)",
                },
              }}
            >
              Humanize Text
            </Button>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <StatCard title="Total Scans" value={stats.total} icon={<Analytics />} color="#3b82f6" subtitle="Lifetime document verifications" loading={loading} />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard title="Plagiarism Detected" value={stats.plagiarized} icon={<BugReport />} color="#f87171" subtitle="Instances needing revision" loading={loading} />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard title="Original Content" value={stats.original} icon={<AssignmentTurnedIn />} color="#60a5fa" subtitle="Validated unique documents" loading={loading} />
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}