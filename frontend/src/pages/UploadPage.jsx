import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  TextField,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert
} from "@mui/material";
import { CloudUpload, TextFields, ArrowBack } from "@mui/icons-material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function Upload() {
  const navigate = useNavigate();

  const [uploadMode, setUploadMode] = useState("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) setUploadMode(newMode);
  };

  const handleUpload = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("userToken");

    if (!token) {
      navigate("/auth", {
        state: { message: "Please login to analyze documents." }
      });
      return;
    }

    const cleanToken = token.startsWith('"') ? JSON.parse(token) : token;

    const formData = new FormData();

    if (uploadMode === "text") {
      if (!text.trim()) {
        setError("Please enter some text.");
        setLoading(false);
        return;
      }
      formData.append("text", text);
    } else {
      if (!file) {
        setError("Please select a PDF file first.");
        setLoading(false);
        return;
      }
      formData.append("file", file);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cleanToken.trim()}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/results", {
          state: {
            score: data.percentage,
            text: data.extracted_text,
            analysis: data.analysis,
            ai_insight: data.ai_insight
          }
        });
      } else if (response.status === 401) {
        localStorage.removeItem("userToken");
        navigate("/auth", {
          state: { message: "Session expired. Please login again." }
        });
      } else {
        setError(data.msg || "Analysis failed.");
      }

    } catch (err) {
      console.error(err);
      setError("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#000", color: "#fff", display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Header />

      <Box component="main" sx={{ flexGrow: 1, overflowY: "auto", py: 6 }}>

      <Box sx={{ px: { xs: 2, md: 4 }, mb: 1 }}>
        <Button
          variant="text"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/dashboard")}
          sx={{ color: "#bfdbfe", textTransform: "none", fontWeight: 700, px: 0 }}
        >
          Back
        </Button>
      </Box>

      <Container maxWidth="md">

        <Typography
          variant="h3"
          textAlign="center"
          sx={{
            mb: 1,
            color: "#fff",
            fontWeight: 800,
            fontSize: { xs: "2rem", md: "3rem" },
            background: "linear-gradient(90deg, #ffffff, #60a5fa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Upload Assignment
        </Typography>

        <Typography textAlign="center" sx={{ mb: 4, color: "#94a3b8" }}>
          Paste text or upload a PDF to run plagiarism analysis.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <ToggleButtonGroup
          value={uploadMode}
          exclusive
          onChange={handleModeChange}
          sx={{
            mb: 4,
            width: { xs: "100%", sm: "auto" },
            display: "flex",
            flexWrap: { xs: "wrap", sm: "nowrap" },
            backgroundColor: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 2,
            p: 0.5,
            "& .MuiToggleButton-root": {
              color: "#cbd5e1",
              border: "none",
              borderRadius: 1.5,
              textTransform: "none",
              px: 2,
              flex: { xs: 1, sm: "initial" },
            },
            "& .MuiToggleButton-root.Mui-selected": {
              color: "#fff",
              backgroundColor: "#2563eb",
            },
            "& .MuiToggleButton-root.Mui-selected:hover": {
              backgroundColor: "#1d4ed8",
            },
          }}
        >
          <ToggleButton value="text">
            <TextFields sx={{ mr: 1 }} /> Paste Text
          </ToggleButton>

          <ToggleButton value="file">
            <CloudUpload sx={{ mr: 1 }} /> Upload PDF
          </ToggleButton>
        </ToggleButtonGroup>

        {uploadMode === "text" ? (
          <TextField
            multiline
            rows={10}
            fullWidth
            placeholder="Paste text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            sx={{
              "& .MuiInputBase-root": {
                color: "#e2e8f0",
                backgroundColor: "#0f172a",
                borderRadius: 2,
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1e293b",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#3b82f6",
              },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#60a5fa",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "#64748b",
                opacity: 1,
              },
            }}
          />
        ) : (
          <Paper
            component="label"
            sx={{
              display: "flex",
              width: "100%",
              minHeight: 220,
              p: { xs: 3, md: 6 },
              textAlign: "center",
              alignItems: "center",
              justifyContent: "center",
              border: "2px dashed #3b82f6",
              backgroundColor: "#0f172a",
              color: "#e2e8f0",
              cursor: "pointer",
              borderRadius: 3,
            }}
          >
            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <Typography>
              {file ? file.name : "Click to upload PDF"}
            </Typography>
          </Paper>
        )}

        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={loading}
            sx={{
              px: { xs: 3, md: 4 },
              py: 1.3,
              borderRadius: 999,
              fontWeight: 700,
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              backgroundColor: "#2563eb",
              "&:hover": { backgroundColor: "#1d4ed8" },
            }}
          >
            {loading ? <CircularProgress size={25} /> : "Analyze Plagiarism"}
          </Button>
        </Box>

      </Container>

      </Box>

      <Footer />
    </Box>
  );
}