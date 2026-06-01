import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

import "./styles/global.scss";
import { LoadingProvider } from "./Context/LoadingContext.jsx";
import { ContextProvider } from "./Context/Context.jsx";

export const baseUrl = import.meta.env.VITE_BASE_URL;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ContextProvider>
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </ContextProvider>
  </StrictMode>,
);
