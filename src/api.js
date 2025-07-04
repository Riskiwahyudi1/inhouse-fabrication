import axios from 'axios';

const api = axios.create({
  baseURL: window.location.hostname.includes("inhouse-fab.wahyudiriski.my.id")
    ? "https://api.inhouse-fab.wahyudiriski.my.id"
    : "http://localhost:5000",
});

export default api;
