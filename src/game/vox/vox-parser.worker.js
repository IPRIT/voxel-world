import registerPromiseWorker from 'promise-worker/register';
import { voxLoadAndParse } from "./vox-parser";

registerPromiseWorker(url => {
  return voxLoadAndParse( url );
});
