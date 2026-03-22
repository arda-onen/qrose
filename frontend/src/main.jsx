import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* Tek kaydırma zinciri: restoran layout ile #root yüksekliği hizalanır */}
        <div className="h-full min-h-0" id="app-shell">
          <App />
        </div>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
