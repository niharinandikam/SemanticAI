import React from "react";
import { Box, Typography, Container } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#0f172a", // Slate 900
        color: "#94a3b8",
        py: 2.5,
        mt: 'auto',
        borderTop: "3px solid #3b82f6", // Matching Blue Border
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          flexDirection: { xs: "column", md: "row" },
          gap: 2 
        }}>

          {/* Copyright Area */}
          <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500, textAlign: "center" }}>
            © 2026 Semantic AI Detection System. All rights reserved.
          </Typography>

        </Box>
      </Container>
    </Box>
  );
}