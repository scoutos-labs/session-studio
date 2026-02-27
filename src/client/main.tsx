import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";

const root_el = document.getElementById("root");
if (!root_el) throw new Error("Root element not found");

createRoot(root_el).render(
  <StrictMode>
    <App />
  </StrictMode>
);
