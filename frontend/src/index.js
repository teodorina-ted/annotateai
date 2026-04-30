import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const link1 = document.createElement("link");
link1.rel = "stylesheet";
link1.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
document.head.appendChild(link1);

const link2 = document.createElement("link");
link2.rel = "stylesheet";
link2.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
document.head.appendChild(link2);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
