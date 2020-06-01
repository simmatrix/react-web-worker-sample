import "./styles.css";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import useWorker from "react-webworker-hook";

import workerFile from "./sample-worker";
import createWebWorker from "./worker-utils";

function App() {
  const [webWorker, setWebWorker] = useState();
  const [data, postData] = useWorker({ worker: webWorker });

  useEffect(() => {
    if (data) console.log("main component", data);
  }, [data]);

  useEffect(() => {
    setWebWorker(createWebWorker(workerFile));
  }, []);

  useEffect(() => {
    postData(2);
  }, [webWorker]);

  return (
    <div className="App">
      Please check browser's console
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
