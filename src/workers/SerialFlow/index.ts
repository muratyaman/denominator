import { Denominator } from '../../Denominator.ts';
import { ICtx, IWorker, IWorkerConfig, IWorkerInfo } from '../../types.ts';
import { IWorkerFactory, WorkerMaker } from '../../factories.ts';

const ERR_NO_CONFIG      = 'SerialFlow worker has no config';
const ERR_NO_DENOMINATOR = 'SerialFlow worker has no denominator';
const ERR_NO_FLOWS       = 'SerialFlow worker has no flow';

export interface SerialFlowConfig extends IWorkerConfig {
  flows: string[];
}

export class SerialFlow implements IWorker<SerialFlowConfig> {
  d: Denominator | null = null;
  config: SerialFlowConfig | null = null;

  flows: string[] = [];

  async info(): Promise<IWorkerInfo> {
    const info: IWorkerInfo = {
      name: 'SerialFlow',
      version: '1.0.0',
      desc: 'runs multiple flows with a copy of ctx',
    };
    return Promise.resolve(info);
  }

  async init(): Promise<void> {
    console.log('SerialFlow.init()');
    const c = this.getConfig();
    this.flows = c.flows;
    if (0 === this.flows.length) {
      throw new Error(ERR_NO_FLOWS);
    }
  }

  getDenominator(): Denominator {
    if (this.d) return this.d;
    throw new Error(ERR_NO_DENOMINATOR);
  }

  getConfig(): SerialFlowConfig {
    if (this.config) return this.config;
    throw new Error(ERR_NO_CONFIG);
  }

  async run(ctx: ICtx): Promise<void> {
    console.log('SerialFlow.run()');
    const d = this.getDenominator();
    for (const flowId of this.flows) {
      for (const worker of d.getFlowWorkers(flowId)) {
        await worker.run(ctx); // run sequentially
      }
    }
  }

  async deinit(): Promise<void> {

  }

}

const maker: WorkerMaker = () => new SerialFlow();

export function register(factory: IWorkerFactory): void {
  factory.register('SerialFlow', maker);
}
