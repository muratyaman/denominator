import { uuid } from '../../../deps.ts';
import { Denominator } from '../../Denominator.ts';
import { ICtx, IWorker, IWorkerConfig, IWorkerInfo } from '../../types.ts';
import { IWorkerFactory, WorkerMaker } from '../../factories.ts';

export interface IdConfig extends IWorkerConfig {

}

export class Id implements IWorker<IdConfig> {
  d: Denominator | null = null;
  config: IdConfig | null = null;

  async info(): Promise<IWorkerInfo> {
    const info: IWorkerInfo = {
      name: 'Id',
      version: '1.0.0',
      desc: 'sets ctx.id using new UUID',
    };
    return Promise.resolve(info)
  }

  async init(): Promise<void> {
    
  }

  async run(ctx: ICtx): Promise<void> {
    ctx['id'] = uuid.generate();
  }

  async deinit() {
    this.d = null;
    this.config = null;
  }

}

const maker: WorkerMaker = () => new Id();

export function register(factory: IWorkerFactory) {
  factory.register('id', maker);
}
