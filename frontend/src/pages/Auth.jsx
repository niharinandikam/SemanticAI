import React, { useState } from "react";
import { 
  Box, Typography, Card, CardContent, TextField, 
  Button, Container, InputAdornment, IconButton, Link, Alert, Fade 
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
// Import the configuration
import { API_BASE_URL } from "../config";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(""); 
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Ensure there's no double slash in the URL
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const endpoint = isLogin 
      ? `${baseUrl}/login` 
      : `${baseUrl}/register`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // Success! Save data and redirect
          localStorage.setItem("userToken", data.access_token);
          localStorage.setItem("userEmail", data.user.email);
          localStorage.setItem("userName", data.user.name || "User");
          navigate("/dashboard");
        } else {
          // Registration success
          setShowSuccess(true);
          setTimeout(() => {
            setIsLogin(true);
            setShowSuccess(false);
            setFormData({ name: "", email: "", password: "" });
          }, 2000);
        }
      } else {
        // Show actual error message from backend
        setError(data.msg || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      // Only show the wakeup message if it's truly a connection failure
      setError("Server connection failed. If this is the first time today, the server may need 1 minute to start up. Please check your internet or try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      color: "#f8fafc",
      fontFamily: "'Inter', sans-serif",
      "& fieldset": { borderColor: "#1e293b" },
      "&:hover fieldset": { borderColor: "#3b82f6" },
      "&.Mui-focused fieldset": { borderColor: "#2563eb" },
    },
    "& .MuiInputLabel-root": { color: "#94a3b8" },
  };

  let submitLabel = "Sign Up";
  if (loading) {
    submitLabel = "Processing...";
  } else if (isLogin) {
    submitLabel = "Sign In";
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", backgroundColor: "#000000" }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", py: { xs: 3, md: 4 }, px: { xs: 1.5, md: 0 } }}>
        <Container maxWidth="sm">
          <Card sx={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 5, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Fade in={showSuccess} unmountOnExit>
                <Alert severity="success" sx={{ mb: 3 }}>Account created! Log in now.</Alert>
              </Fade>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Typography variant="h4" fontWeight="800" textAlign="center" color="white" mb={1} sx={{ fontSize: { xs: "1.8rem", md: "2.125rem" } }}>
                {isLogin ? "Welcome Back" : "Create Account"}
              </Typography>
              <Typography variant="body2" textAlign="center" color="#94a3b8" mb={4}>
                {isLogin ? "Enter your details to access your dashboard" : "Sign up to start checking for plagiarism"}
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                {!isLogin && (
                  <TextField 
                    fullWidth 
                    label="Full Name" 
                    name="name" 
                    required 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    sx={inputStyle} 
                  />
                )}
                <TextField 
                  fullWidth 
                  label="Email Address" 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  sx={inputStyle} 
                />
                <TextField 
                  fullWidth 
                  label="Password" 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  required 
                  value={formData.password} 
                  onChange={handleInputChange}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: "#94a3b8" }}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={inputStyle} 
                />
                <Button 
                  type="submit" 
                  fullWidth 
                  variant="contained" 
                  disabled={loading}
                  sx={{ 
                    py: 1.5, 
                    mt: 1,
                    borderRadius: "50px", 
                    bgcolor: "#2563eb", 
                    fontWeight: "bold",
                    textTransform: "none",
                    fontSize: "1rem",
                    "&:hover": { bgcolor: "#1d4ed8" }
                  }}
                >
                  {submitLabel}
                </Button>
              </Box>

              <Typography textAlign="center" sx={{ mt: 3, color: "#94a3b8" }}>
                {isLogin ? "New here? " : "Already a member? "}
                <Link 
                  component="button" 
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }} 
                  sx={{ color: "#3b82f6", fontWeight: "700", textDecoration: "none" }}
                >
                  {isLogin ? "Create account" : "Sign in instead"}
                </Link>
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}