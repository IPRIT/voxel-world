import registerPromiseWorker from 'promise-worker/register';
import { computeVertices } from "./compute-vertices";

registerPromiseWorker(context => {
  return computeVertices( context );
});
