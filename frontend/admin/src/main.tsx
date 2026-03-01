import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@cloudscape-design/global-styles/index.css";
import { applyMode, Mode } from "@cloudscape-design/global-styles";

applyMode(Mode.Dark);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
