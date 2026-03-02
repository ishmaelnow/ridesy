import { createRoot } from "react-dom/client";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

if (import.meta.env.VITE_APP_MODE === "driver") {
  import("./AppDriver").then(({ default: AppDriver }) => {
    root.render(<AppDriver />);
  });
} else {
  import("./App").then(({ default: App }) => {
    root.render(<App />);
  });
}
