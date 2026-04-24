// src/config.js

const REMOTE_API_BASE_URL = "https://huggingface.co/spaces/HimaVarshitha/plagiarism-checker/proxy/7860";
const LOCAL_API_BASE_URL = "http://127.0.0.1:5000";

const envApiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const hostName = globalThis.location.hostname;

const hostSegments = hostName.split(".");
const firstOctet = Number(hostSegments[0]);
const secondOctet = Number(hostSegments[1]);
const is172Private = firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31;

const isLocalDevHost =
  hostName === "localhost" ||
  hostName === "127.0.0.1" ||
  hostName === "0.0.0.0" ||
  hostName.startsWith("10.") ||
  hostName.startsWith("192.168.") ||
  is172Private;

export const API_BASE_URL = envApiBaseUrl || (isLocalDevHost ? LOCAL_API_BASE_URL : REMOTE_API_BASE_URL);