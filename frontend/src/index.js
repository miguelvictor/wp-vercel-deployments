import React from "react";
import ReactDOM from "react-dom";
import Settings from "./Settings";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <Settings />
  </React.StrictMode>,
  document.getElementById("dfse_settings_container")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
