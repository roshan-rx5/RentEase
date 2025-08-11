import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handlers to prevent unhandled promise rejections
window.addEventListener('error', (event) => {
  console.warn('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled promise rejection:', event.reason);
  // Prevent the unhandled rejection from appearing in the console
  event.preventDefault();
});

createRoot(document.getElementById("root")!).render(<App />);
