import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Card, Avatar, Container, Grid, 
  TextField, Button, CardContent, CircularProgress, Alert
} from "@mui/material";
import { Person, BarChart } from "@mui/icons-material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userInfo, setUserInfo] = useState({ name: "", email: "", scans: 0 });
  const [tempInfo, setTempInfo] = useState({ ...userInfo });

  const fetchProfile = async () => {
    let token = localStorage.getItem("userToken");
    if (!token) {
      setError("Please login to view profile.");
      setLoading(false);
      return;
    }

    const cleanToken = token.startsWith('"') ? JSON.parse(token) : token;

    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${cleanToken.trim()}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        setTempInfo(data);
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.msg || "Error loading profile.");
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Backend unreachable. Check if Flask is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleEditToggle = () => { setIsEditing(true); setTempInfo({...userInfo}); };
  const handleCancel = () => { setIsEditing(false); setError(""); };

  const handleSave = async () => {
    const token = localStorage.getItem("userToken");
    const cleanToken = token.startsWith('"') ? JSON.parse(token) : token;

    try {
      // Fixed the endpoint to /profile and corrected the fetch syntax
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${cleanToken.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: tempInfo.name })
      });

      if (response.ok) {
        setUserInfo({...userInfo, name: tempInfo.name});
        setIsEditing(false);
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to save profile.");
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Error connecting to server.");
    }
  };

  const textFieldStyle = {
    mb: 2,
    bgcolor: "rgba(255,255,255,0.05)",
    borderRadius: 2,
    "& .MuiFilledInput-root": {
      color: "#f8fafc",
      fontFamily: "'Inter', sans-serif",
      "&:before, &:after": { display: "none" },
    },
    "& .MuiInputLabel-root": { 
      color: "#94a3b8",
      fontFamily: "'Poppins', sans-serif" 
    },
  };

  if (loading) return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", bgcolor: "#000" }}>
      <Header />
      <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: "#2563eb" }} />
      </Box>
      <Footer />
    </Box>
  );

  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100vh", 
      overflow: "hidden", 
      bgcolor: "#000",
      fontFamily: "'Inter', sans-serif" 
    }}>
      <Header />
      <Box component="main" sx={{ 
        flexGrow: 1, overflowY: "auto", py: { xs: 5, md: 8 },
        "&::-webkit-scrollbar": { width: "8px" },
        "&::-webkit-scrollbar-track": { background: "#000" },
        "&::-webkit-scrollbar-thumb": { background: "#1e293b", borderRadius: "10px" }
      }}>
        <Container maxWidth="md">
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: "#1a0505", color: "#fca5a5" }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2, bgcolor: "#064e3b", color: "#6ee7b7" }}>{success}</Alert>}
          
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Avatar sx={{ 
              width: { xs: 92, md: 110 }, height: { xs: 92, md: 110 }, mx: "auto", mb: 2, 
              bgcolor: "#2563eb", fontSize: "3rem", fontWeight: "bold",
              boxShadow: "0 0 20px rgba(37, 99, 235, 0.4)" 
            }}>
              {userInfo.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h3" fontWeight="800" sx={{ 
              color: "white", 
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "-0.02em",
              fontSize: { xs: "2rem", md: "3rem" }
            }}>
              User Profile
            </Typography>
            <Typography sx={{ color: "#94a3b8", mt: 1 }}>Manage your personal account settings</Typography>
          </Box>

          <Card sx={{ 
            bgcolor: "#0f172a", 
            border: "1px solid #1e293b", 
            borderRadius: 5, 
            color: "white",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)" 
          }}>
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Grid container spacing={{ xs: 3, md: 5 }}>
                <Grid item xs={12} sm={7}>
                  <Typography variant="h6" sx={{ 
                    color: "#60a5fa", mb: 3, display: 'flex', alignItems: 'center', gap: 1.5,
                    fontFamily: "'Poppins', sans-serif", fontWeight: "700"
                  }}>
                    <Person /> Identity Details
                  </Typography>
                  <TextField 
                    fullWidth label="Display Name" variant="filled" 
                    value={isEditing ? tempInfo.name : userInfo.name} 
                    onChange={(e) => setTempInfo({...tempInfo, name: e.target.value})}
                    slotProps={{ input: { readOnly: !isEditing } }}
                    sx={textFieldStyle} 
                  />
                  <TextField 
                    fullWidth label="Email Address" variant="filled" 
                    value={userInfo.email} slotProps={{ input: { readOnly: true } }}
                    sx={textFieldStyle} 
                  />
                </Grid>
                
                <Grid item xs={12} sm={5}>
                  <Typography variant="h6" sx={{ 
                    color: "#60a5fa", mb: 3, display: 'flex', alignItems: 'center', gap: 1.5,
                    fontFamily: "'Poppins', sans-serif", fontWeight: "700"
                  }}>
                    <BarChart /> Activity Stats
                  </Typography>
                  <Box sx={{ 
                    p: { xs: 3, md: 4 }, bgcolor: "rgba(255,255,255,0.03)", borderRadius: 4, 
                    border: "1px solid #1e293b", textAlign: 'center' 
                  }}>
                    <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.75rem" }}>
                      Total Scans
                    </Typography>
                    <Typography variant="h2" sx={{ 
                      color: "#3b82f6", fontWeight: "900", 
                      fontFamily: "'Poppins', sans-serif" 
                    }}>
                      {userInfo.scans}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 3, flexDirection: { xs: "column", sm: "row" } }}>
                {isEditing ? (
                  <>
                    <Button 
                      variant="contained" 
                      onClick={handleSave} 
                      sx={{ 
                        borderRadius: "50px", px: { xs: 4, md: 6 }, py: 1.5, bgcolor: "#10b981", 
                        width: { xs: "100%", sm: "auto" },
                        fontWeight: "800", textTransform: "none", fontFamily: "'Poppins', sans-serif",
                        "&:hover": { bgcolor: "#059669" }
                      }}>
                      Save Changes
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={handleCancel} 
                      sx={{ 
                        color: "#f87171", borderColor: "#f87171", borderRadius: "50px", px: { xs: 4, md: 6 }, py: 1.5,
                        width: { xs: "100%", sm: "auto" },
                        fontWeight: "800", textTransform: "none", fontFamily: "'Poppins', sans-serif",
                        "&:hover": { borderColor: "#ef4444", bgcolor: "rgba(248,113,113,0.05)" }
                      }}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="contained" 
                    onClick={handleEditToggle} 
                    sx={{ 
                      borderRadius: "50px", px: { xs: 4, md: 6 }, py: 1.5, bgcolor: "#2563eb", 
                      width: { xs: "100%", sm: "auto" },
                      fontWeight: "800", textTransform: "none", fontFamily: "'Poppins', sans-serif",
                      "&:hover": { bgcolor: "#1d4ed8" }
                    }}>
                    Edit Profile
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}