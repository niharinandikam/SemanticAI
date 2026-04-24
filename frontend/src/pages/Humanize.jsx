import React, { useMemo, useState } from "react";
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
  Alert,
} from "@mui/material";
import { CloudUpload, TextFields, AutoFixHigh, Download, ArrowBack } from "@mui/icons-material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function Humanize() {
  const navigate = useNavigate();

  const [uploadMode, setUploadMode] = useState("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resultText, setResultText] = useState("");
  const [resultInputType, setResultInputType] = useState("");
  const [resultFilename, setResultFilename] = useState("humanized_output.txt");

  const hasResult = useMemo(() => Boolean(resultText.trim()), [resultText]);

  const getHumanizeEndpoints = () => {
    const primaryEndpoint = `${API_BASE_URL}/humanize`;
    const isLocalApi = API_BASE_URL.includes("127.0.0.1") || API_BASE_URL.includes("localhost");

    if (isLocalApi) {
      return [primaryEndpoint];
    }

    return [primaryEndpoint, "http://127.0.0.1:5000/humanize"];
  };

  const parseApiResponse = async (response) => {
    const rawResponseText = await response.text();
    if (!rawResponseText) {
      return {};
    }

    try {
      return JSON.parse(rawResponseText);
    } catch {
      return { msg: rawResponseText };
    }
  };

  const sendHumanizeRequest = async (requestOptions) => {
    const endpoints = getHumanizeEndpoints();
    let endpointError = null;

    for (const endpoint of endpoints) {
      try {
        return await fetch(endpoint, requestOptions);
      } catch (requestError) {
        endpointError = requestError;
      }
    }

    throw endpointError || new Error("Unable to reach humanize service.");
  };

  const localHumanizeText = (sourceText) => {
    let output = sourceText.replaceAll(/\s+/g, " ").trim();
    if (!output) {
      return "";
    }

    const replacements = [
      [/\butilize\b/gi, "use"],
      [/\bapproximately\b/gi, "about"],
      [/\bin order to\b/gi, "to"],
      [/\btherefore\b/gi, "so"],
      [/\bhowever\b/gi, "still"],
      [/\bdo not\b/gi, "don't"],
      [/\bcannot\b/gi, "can't"],
      [/\bit is\b/gi, "it's"],
    ];

    replacements.forEach(([pattern, value]) => {
      output = output.replace(pattern, value);
    });

    return output;
  };

  const getFallbackFileName = () => {
    if (uploadMode !== "file" || !file?.name) {
      return "humanized_output.txt";
    }

    const lastDot = file.name.lastIndexOf(".");
    const baseName = lastDot > 0 ? file.name.slice(0, lastDot) : file.name;
    return `${baseName}_humanized.txt`;
  };

  const applyLocalFallback = async () => {
    if (uploadMode === "text") {
      const fallbackText = localHumanizeText(text);
      setResultText(fallbackText);
      setResultInputType("text");
      setResultFilename("humanized_output.txt");
      setError("");
      setNotice("Humanize service is unavailable. Displaying a local rewrite.");
      return true;
    }

    if (!file) {
      return false;
    }

    const isPdf = file.name.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      return false;
    }

    const fileText = await file.text();
    const fallbackText = localHumanizeText(fileText);
    setResultText(fallbackText);
    setResultInputType("file");
    setResultFilename(getFallbackFileName());
    setError("");
    setNotice("Humanize service is unavailable. Displaying a local rewrite from uploaded file.");
    return true;
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setUploadMode(newMode);
      setError("");
      setNotice("");
      setResultText("");
      setResultInputType("");
    }
  };

  const getCleanTokenOrRedirect = () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/auth", {
        state: { message: "Please login to use humanize." },
      });
      return null;
    }

    return token.startsWith('"') ? JSON.parse(token) : token;
  };

  const buildHumanizeFormData = () => {
    const formData = new FormData();

    if (uploadMode === "text") {
      if (!text.trim()) {
        setError("Please enter some text.");
        return null;
      }
      formData.append("text", text);
      return formData;
    }

    if (!file) {
      setError("Please select a PDF or TXT file first.");
      return null;
    }

    formData.append("file", file);
    return formData;
  };

  const applyNetworkFailureMessage = () => {
    setError(`Unable to reach Humanize service at ${API_BASE_URL}. Check backend/proxy availability and try again.`);
  };

  const processHumanizeResponse = (response, data) => {
    if (response.ok) {
      setResultText(data.humanized_text || "");
      setResultInputType(data.input_type || uploadMode);
      setResultFilename(data.output_filename || "humanized_output.txt");
      return;
    }

    if (response.status === 401) {
      localStorage.removeItem("userToken");
      navigate("/auth", {
        state: { message: "Session expired. Please login again." },
      });
      return;
    }

    setError(data.msg || `Humanize failed with status ${response.status}.`);
  };

  const handleHumanize = async () => {
    setLoading(true);
    setError("");
    setNotice("");
    setResultText("");
    setResultInputType("");

    const cleanToken = getCleanTokenOrRedirect();
    if (!cleanToken) {
      setLoading(false);
      return;
    }

    const formData = buildHumanizeFormData();
    if (!formData) {
      setLoading(false);
      return;
    }

    try {
      const requestOptions = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cleanToken.trim()}`,
        },
        body: formData,
      };

      const response = await sendHumanizeRequest(requestOptions);
      const data = await parseApiResponse(response);

      processHumanizeResponse(response, data);
    } catch (err) {
      console.error(err);
      try {
        const fallbackApplied = await applyLocalFallback();
        if (!fallbackApplied) {
          applyNetworkFailureMessage();
        }
      } catch {
        applyNetworkFailureMessage();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultText.trim()) return;

    const blob = new Blob([resultText], {
      type: "text/plain;charset=utf-8",
    });
    const url = globalThis.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = resultFilename || "humanized_output.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    globalThis.URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
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
              background: "linear-gradient(90deg, #ffffff, #93c5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Humanize Content
          </Typography>

          <Typography textAlign="center" sx={{ mb: 4, color: "#94a3b8" }}>
            Paste text or upload a file to generate a more natural version.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {notice && <Alert severity="info" sx={{ mb: 3 }}>{notice}</Alert>}

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
              <CloudUpload sx={{ mr: 1 }} /> Upload File
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
                accept=".pdf,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Typography>
                {file ? file.name : "Click to upload PDF or TXT file"}
              </Typography>
            </Paper>
          )}

          <Box textAlign="center" mt={4}>
            <Button
              variant="contained"
              onClick={handleHumanize}
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
              startIcon={loading ? undefined : <AutoFixHigh />}
            >
              {loading ? <CircularProgress size={25} /> : "Humanize"}
            </Button>
          </Box>

          {hasResult && (
            <Box mt={5}>
              <Typography variant="h6" sx={{ mb: 1.5, color: "#bfdbfe", fontWeight: 700 }}>
                Humanized Preview
              </Typography>

              <TextField
                multiline
                rows={10}
                fullWidth
                value={resultText}
                slotProps={{ input: { readOnly: true } }}
                sx={{
                  "& .MuiInputBase-root": {
                    color: "#e2e8f0",
                    backgroundColor: "#0f172a",
                    borderRadius: 2,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1e293b",
                  },
                }}
              />

              {resultInputType === "file" && (
                <Box mt={2.5}>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleDownload}
                    sx={{
                      borderColor: "#60a5fa",
                      color: "#bfdbfe",
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 999,
                      px: 3,
                      "&:hover": {
                        borderColor: "#93c5fd",
                        backgroundColor: "rgba(59, 130, 246, 0.12)",
                      },
                    }}
                  >
                    Download Humanized File
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}