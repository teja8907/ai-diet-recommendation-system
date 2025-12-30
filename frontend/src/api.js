const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://ai-diet-recommendation-system.onrender.com"
    : "http://127.0.0.1:8000";

export default API_BASE_URL;
