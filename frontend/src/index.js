import React from "react";
import ReactDOM from "react-dom";
import Main from "./Main";
import Settings from "./Settings";
import reportWebVitals from "./reportWebVitals";

const settingsContainer = document.getElementById("dfse-settings-container");
if (settingsContainer) {
  ReactDOM.render(
    <React.StrictMode>
      <Settings />
    </React.StrictMode>,
    settingsContainer
  );
}

const mainContainer = document.getElementById("dfse-main-container");
if (mainContainer) {
  ReactDOM.render(
    <React.StrictMode>
      <Main />
    </React.StrictMode>,
    mainContainer
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
