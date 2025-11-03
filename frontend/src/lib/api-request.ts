import axios from "axios";

const apiRequest = axios.create({
  baseURL: "/api", // Your API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiRequest;