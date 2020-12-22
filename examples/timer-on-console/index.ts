//import { signalLib } from './deps.ts'; // unstable
import { Denominator } from '../../mod.ts';

const d = new Denominator();
//const signalHandle = signalLib.onSignal(Deno.Signal.SIGINT, onInterrupt);
main();

async function main(configFile = './denominator.json'): Promise<void> {
  await d.loadConfig(configFile);
  await d.init();
  await d.start();
}

async function onInterrupt() {
  //if (signalHandle) {
  //  signalHandle.dispose(); // de-register from receiving further events
  //}
  await d.stop();
  await d.deinit();
}
