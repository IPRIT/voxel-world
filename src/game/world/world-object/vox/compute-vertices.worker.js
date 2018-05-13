import registerWebworker from 'webworker-promise/lib/register';
import { computeVertices } from "./compute-vertices";

registerWebworker(context => {
  return computeVertices( context );
});
