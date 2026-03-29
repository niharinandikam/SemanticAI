import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
// Icons
import { 
  AutoAwesome, 
  History, 
  AccountCircle, 
  Logout, 
  Dashboard, 
  Home, 
  Login,
  Menu,
  Close,
} from "@mui/icons-material";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = localStorage.getItem("userToken");

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    setMobileMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/", icon: <Home fontSize="small" /> },
    { name: "Dashboard", path: "/dashboard", icon: <Dashboard fontSize="small" /> },
    { name: "History", path: "/history", icon: <History fontSize="small" /> },
    { name: "Profile", path: "/profile", icon: <AccountCircle fontSize="small" /> },
  ];

  let authActions;
  if (!isLoggedIn) {
    authActions = (
      <Button
        variant="contained"
        component={Link}
        to="/auth"
        startIcon={<Login />}
        sx={{
          backgroundColor: "#3b82f6",
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: "700",
          px: { xs: 2, md: 3 },
          py: { xs: 0.8, md: 1 },
          "&:hover": { backgroundColor: "#2563eb" },
        }}
      >
        Login
      </Button>
    );
  } else if (isMobile) {
    authActions = (
      <>
        <IconButton
          onClick={() => setMobileMenuOpen(true)}
          sx={{ color: "#cbd5e1" }}
          aria-label="Open navigation menu"
        >
          <Menu />
        </IconButton>
        <Drawer
          anchor="right"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          slotProps={{
            paper: {
              sx: {
                width: "78vw",
                maxWidth: 320,
                bgcolor: "#0f172a",
                color: "#cbd5e1",
                borderLeft: "1px solid #1e293b",
              },
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontWeight: 700, color: "#fff" }}>Navigation</Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: "#94a3b8" }} aria-label="Close navigation menu">
              <Close />
            </IconButton>
          </Box>

          <List sx={{ p: 1.5 }}>
            {navLinks.map((link) => (
              <ListItemButton
                key={link.name}
                component={Link}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  color: location.pathname === link.path ? "#3b82f6" : "#cbd5e1",
                  bgcolor: location.pathname === link.path ? "rgba(59, 130, 246, 0.12)" : "transparent",
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>{link.icon}</ListItemIcon>
                <ListItemText primary={link.name} />
              </ListItemButton>
            ))}
          </List>

          <Box sx={{ p: 2, mt: "auto", borderTop: "1px solid #1e293b" }}>
            <Button
              fullWidth
              onClick={handleLogout}
              variant="outlined"
              startIcon={<Logout />}
              sx={{
                color: "#f87171",
                borderColor: "rgba(248, 113, 113, 0.4)",
                textTransform: "none",
                fontWeight: "700",
                borderRadius: "10px",
                "&:hover": { borderColor: "#f87171", bgcolor: "rgba(248, 113, 113, 0.1)" },
              }}
            >
              Logout
            </Button>
          </Box>
        </Drawer>
      </>
    );
  } else {
    authActions = (
      <Stack direction="row" spacing={1} alignItems="center">
        {navLinks.map((link) => (
          <Button 
            key={link.name}
            component={Link} 
            to={link.path} 
            startIcon={link.icon}
            sx={{ 
              color: location.pathname === link.path ? "#3b82f6" : "#cbd5e1", 
              textTransform: "none", 
              fontWeight: "600", 
              px: 2,
              borderRadius: "8px",
              transition: "0.3s",
              "&:hover": { color: "#fff", bgcolor: "rgba(59, 130, 246, 0.15)" } 
            }}
          >
            {link.name}
          </Button>
        ))}

        <Button 
          onClick={handleLogout} 
          variant="outlined"
          startIcon={<Logout />}
          sx={{ 
            color: "#f87171", 
            borderColor: "rgba(248, 113, 113, 0.4)", 
            textTransform: "none",
            fontWeight: "700",
            borderRadius: "8px",
            ml: 1,
            "&:hover": { borderColor: "#f87171", bgcolor: "rgba(248, 113, 113, 0.1)" }
          }}
        >
          Logout
        </Button>
      </Stack>
    );
  }

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: "#1e293b", // Slate 800: Strong contrast against black body
        backgroundImage: "none",
        borderBottom: "3px solid #3b82f6", // Thicker blue border for clear definition
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
        zIndex: 1100
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 75 }, py: { xs: 0.5, md: 0 }, justifyContent: "space-between" }}>
          
          {/* Logo Section */}
          <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none", gap: 1 }}>
            <AutoAwesome sx={{ color: "#3b82f6", fontSize: { xs: "1.6rem", md: "2rem" } }} />
            <Typography 
              variant="h5"
              sx={{ 
                fontWeight: "900", 
                color: "#fff",
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: "0.5px",
                fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
              }}
            >
              SEMANTIC<span style={{ color: "#3b82f6" }}>AI</span>
            </Typography>
          </Box>

          {/* Navigation Menu */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {authActions}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}