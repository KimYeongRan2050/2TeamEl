import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import reportWebVitals from "./reportWebVitals";
import MainPage from "./pages/MainPage";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <div>
    <MainPage />
  </div>
);

reportWebVitals();
