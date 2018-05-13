import registerPromiseWorker from 'webworker-promise/lib/register';
import { voxLoadAndParse } from "./vox-parser";

registerPromiseWorker(async (url) => {
  return voxLoadAndParse( url );
});
