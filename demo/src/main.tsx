import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import App2 from "./App2";

// // react 18
// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

//react 17
ReactDOM.render(
  <React.StrictMode>
    {/*<App />*/}
    <App2 />
  </React.StrictMode>,
  document.getElementById("root")
);
