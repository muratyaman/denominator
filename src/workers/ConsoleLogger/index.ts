import { Denominator } from '../../Denominator.ts';
import { ICtx, IWorker, IWorkerConfig, IWorkerInfo, IEventSender } from '../../types.ts';
import { IWorkerFactory, WorkerMaker } from '../../factories.ts';

export interface ConsoleLoggerConfig extends IWorkerConfig {

}

export class ConsoleLogger implements IWorker<ConsoleLoggerConfig> {
  d: Denominator | null = null;
  config: ConsoleLoggerConfig | null = null;

  async info(): Promise<IWorkerInfo> {
    const info: IWorkerInfo = {
      name: 'Console',
      version: '1.0.0',
      desc: 'sets ctx.id using new UUID',
    };
    return Promise.resolve(info);
  }

  async init(): Promise<void> {
    
  }

  async run(ctx: ICtx): Promise<void> {
    console.log(ctx);
  }

  async deinit(): Promise<void> {
    
  }

}

const maker: WorkerMaker = () => new ConsoleLogger();

export function register(factory: IWorkerFactory): void {
  factory.register('ConsoleLogger', maker);
}
