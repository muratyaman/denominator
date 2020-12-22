import { Denominator } from '../../Denominator.ts';
import { ICtx, IWorker, IWorkerConfig, IWorkerInfo, IEventSender } from '../../types.ts';
import { IWorkerFactory, WorkerMaker } from '../../factories.ts';

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
    console.log('TimeStamp.init() config', this.config);
    if (!this.config) throw new Error('TimeStamp worker has no config');
    this.field = this.config.field;
    if (this.field) {
      // ok
    } else {
      throw new Error('TimeStamp worker has no field');
    }
  }

  async run(ctx: ICtx): Promise<Boolean> {
    console.log('TimeStamp.run() config', this.config);
    if (!this.field) throw new Error('TimeStamp worker has no field');
    ctx[this.field] = new Date();
    return true;
  }

  async deinit(): Promise<void> {
    console.log('TimeStamp.deinit() config', this.config);
  }

}

const maker: WorkerMaker = () => new TimeStamp();

export function register(factory: IWorkerFactory): void {
  factory.register('TimeStamp', maker);
}
