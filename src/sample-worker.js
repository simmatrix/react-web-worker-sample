/* eslint-disable no-restricted-globals */
export default () => {
  /**
   * Supporting function
   * - Adding the function here instead of importing it from './worker-utils.js'
   * - because imports of external module seems not to work well
   */
  const createWebWorker = (workerFile) => {
    let code = workerFile.toString();
    code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));
    const blob = new Blob([code], { type: "application/javascript" });
    return new Worker(URL.createObjectURL(blob), { type: "module" });
  };

  /**
   * Function for sub worker
   */
  const subWorkerFunction = function () {
    self.onmessage = function ({ data: count }) {
      setTimeout(() => {
        // Can't use axios here because web worker has no access to 'document'
        // To make API call, have got to depend on XMLHttpRequest
        // See here for a list of functions and classes available to web worker
        // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            console.log("sub worker", count);
            self.postMessage(xhttp.responseText);
          }
        };
        xhttp.open("GET", `https://reqres.in/api/users?page=${count}`, true);
        xhttp.send();
      }, count * 1000); 
      // Use setTimeout() and gradually increasing of the timeout millisecond per call
      // to act as an alternative to async-await call, which can't be used in web worker
    };
  };

  /**
   * Initializing the sub worker
   */
  const subWorker = createWebWorker(subWorkerFunction);

  /**
   * Receiving message from the sub worker
   * Note: 'data' is a built-in param, which contains the item we sent
   */
  subWorker.onmessage = ({ data }) => {
    self.postMessage(data);
  };

  /**
   * Receiving message from the parent
   * Note: 'data' is a built-in param, which contains the item we sent
   */
  self.onmessage = ({ data: totalCount }) => {
    let count = 1;
    while (count <= totalCount) {
      console.log("main worker", count);
      // Spawn a new sub worker to handle the load
      subWorker.postMessage(count);
      count++;
    }
  };
};
