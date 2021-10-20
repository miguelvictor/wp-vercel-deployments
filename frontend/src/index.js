import React from "react";
import ReactDOM from "react-dom";
import Settings from "./Settings";
import reportWebVitals from "./reportWebVitals";

const settingsContainer = document.getElementById("dfse_settings_container");
if (settingsContainer) {
  ReactDOM.render(
    <React.StrictMode>
      <Settings />
    </React.StrictMode>,
    settingsContainer
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
