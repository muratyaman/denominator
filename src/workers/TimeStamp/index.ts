import { Denominator } from '../../Denominator.ts';
import { ICtx, IWorker, IWorkerConfig, IWorkerInfo, IEventSender } from '../../types.ts';
import { IWorkerFactory, WorkerMaker } from '../../factories.ts';

const ERR_NO_CONFIG = 'TimeStamp worker has no config';
const ERR_NO_CONFIG_FIELD = 'TimeStamp worker config has no field';

export interface TimeStampConfig extends IWorkerConfig {
  field: string;
}

export class TimeStamp implements IWorker<TimeStampConfig> {
  d: Denominator | null = null;
  config: TimeStampConfig | null = null;

  private field: string = 'ts';

  async info(): Promise<IWorkerInfo> {
    const info: IWorkerInfo = {
      name: 'TimeStamp',
      version: '1.0.0',
      desc: 'sets. ctx[field] using new Date',
    };
    return Promise.resolve(info);
  }

  async init(): Promise<void> {
    if (!this.config) throw new Error(ERR_NO_CONFIG);
    this.field = this.config.field.trim();
    if (this.field === '') throw new Error(ERR_NO_CONFIG_FIELD);
  }

  async run(ctx: ICtx): Promise<void> {
    ctx[this.field] = new Date();
  }

  async deinit(): Promise<void> {
    
  }

}

const maker: WorkerMaker = () => new TimeStamp();

export function register(factory: IWorkerFactory): void {
  factory.register('TimeStamp', maker);
}
