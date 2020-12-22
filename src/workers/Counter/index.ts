import { Denominator } from '../../Denominator.ts';
import { ICtx, IWorker, IWorkerConfig, IWorkerInfo } from '../../types.ts';
import { IWorkerFactory, WorkerMaker } from '../../factories.ts';

export interface CounterConfig extends IWorkerConfig {
  field: string;
}

export class Counter implements IWorker<CounterConfig> {
  d: Denominator | null = null;
  config: CounterConfig | null = null;

  c: number = 0;
  field: string = 'counter';

  async info(): Promise<IWorkerInfo> {
    const info: IWorkerInfo = {
      name: 'Counter',
      version: '1.0.0',
      desc: 'sets ctx[field] using incremented counter',
    };
    return Promise.resolve(info);
  }

  async init(): Promise<void> {
    if (!this.config) {
      throw new Error('Counter worker has no config');
    }
    this.c = 0;
    this.field = this.config.field;
  }

  async run(ctx: ICtx): Promise<Boolean> {
    this.c += 1;
    ctx[this.field] = this.c;
    return true;
  }

  async deinit(): Promise<void> {
    this.d = null;
    this.config = null;
  }

}

const maker: WorkerMaker = () => new Counter();

export function register(factory: IWorkerFactory) {
  factory.register('Counter', maker);
}
