import { createRoot } from "react-dom/client";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

if (import.meta.env.VITE_APP_MODE === "driver") {
  import("./AppDriver").then(({ default: AppDriver }) => {
    root.render(<AppDriver />);
  });
} else if (import.meta.env.VITE_APP_MODE === "admin") {
  import("./AppAdmin").then(({ default: AppAdmin }) => {
    root.render(<AppAdmin />);
  });
} else {
  import("./App").then(({ default: App }) => {
    root.render(<App />);
  });
}
