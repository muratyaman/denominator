import { Denominator } from '../../Denominator.ts';
import { ICtx, IWorker, IWorkerConfig, IWorkerInfo } from '../../types.ts';
import { IWorkerFactory, WorkerMaker } from '../../factories.ts';

export interface CopyConfig extends IWorkerConfig {
  source: string;
  dest: string;
}

export class Copy implements IWorker<CopyConfig> {
  d: Denominator | null = null;
  config: CopyConfig | null = null;

  source: string = 'input';
  dest: string = 'output';

  async info(): Promise<IWorkerInfo> {
    const info: IWorkerInfo = {
      name: 'Copy',
      version: '1.0.0',
      desc: 'echoes input as output',
    };
    return Promise.resolve(info);
  }

  async init(): Promise<void> {
    if (!this.config) {
      throw new Error('Copy worker has no config');
    }
    this.source = this.config.source;
    this.dest = this.config.dest;
  }

  async run(ctx: ICtx): Promise<Boolean> {
    ctx[this.dest] = ctx[this.source];
    return true;
  }

  async deinit(): Promise<void> {
    this.d = null;
    this.config = null;
  }

}

const maker: WorkerMaker = () => new Copy();

export function register(factory: IWorkerFactory) {
  factory.register('Copy', maker);
}
