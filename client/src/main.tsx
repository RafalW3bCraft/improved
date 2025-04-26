import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/theme/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system">
    <App />
  </ThemeProvider>
);
