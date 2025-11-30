import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { AppProvider } from "./context/AppContext.tsx"; // Import AppProvider

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <AppProvider> {/* Wrap App with AppProvider */}
    <App />
  </AppProvider>
);