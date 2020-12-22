import { Denominator, IDenominatorConfig } from '../../mod.ts';

async function main(configFile = './denominator.json') {
  const configJson = await Deno.readTextFile(configFile);
  const configObj = JSON.parse(configJson);
  const c: IDenominatorConfig = configObj;
  const d = new Denominator(c);  
  await d.init();
  d.start();
}

main('./denominator.json');
