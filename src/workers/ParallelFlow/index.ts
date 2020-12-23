import { Denominator } from '../../Denominator.ts';
import { ICtx, IWorker, IWorkerConfig, IWorkerInfo } from '../../types.ts';
import { IWorkerFactory, WorkerMaker } from '../../factories.ts';

const ERR_NO_CONFIG      = 'ParallelFlow worker has no config';
const ERR_NO_DENOMINATOR = 'ParallelFlow worker has no denominator';
const ERR_NO_FLOWS       = 'ParallelFlow worker has no flow';

export interface ParallelFlowConfig extends IWorkerConfig {
  flows: string[];
}

export class ParallelFlow implements IWorker<ParallelFlowConfig> {
  d: Denominator | null = null;
  config: ParallelFlowConfig | null = null;

  flows: string[] = [];

  async info(): Promise<IWorkerInfo> {
    const info: IWorkerInfo = {
      name: 'ParallelFlow',
      version: '1.0.0',
      desc: 'runs multiple flows with a copy of ctx',
    };
    return Promise.resolve(info);
  }

  async init(): Promise<void> {
    console.log('ParallelFlow.init()');
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

  getConfig(): ParallelFlowConfig {
    if (this.config) return this.config;
    throw new Error(ERR_NO_CONFIG);
  }

  async run(ctx: ICtx): Promise<void> {
    console.log('ParallelFlow.run()');
    const ctxClone: ICtx = Object.assign({}, ctx);
    const d = this.getDenominator();
    for (const flowId of this.flows) {
      for (const worker of d.getFlowWorkers(flowId)) {
        worker.run(ctxClone).then(() => {}); // fire and forget; using then() against warnings
      }
    }
  }

  async deinit(): Promise<void> {

  }

}

const maker: WorkerMaker = () => new ParallelFlow();

export function register(factory: IWorkerFactory): void {
  factory.register('ParallelFlow', maker);
}
