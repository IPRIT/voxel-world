import greenlet from "greenlet";

/**
 * @param fn
 * @returns {function(*=): *}
 */
export default function runInWorker (fn) {
  let workerFn;

  if (!workerFn) {
    if (window.Worker) {
      workerFn = greenlet(fn);
    } else {
      workerFn = fn; // fallback
    }
  }

  return (context) => {
    return workerFn(context);
  }
}
