import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import GameFlow from "./components/GameFlow";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <GameFlow />
    </BrowserRouter>
  </StrictMode>
);
