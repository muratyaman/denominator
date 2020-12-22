import { Denominator } from '../../Denominator.ts';
import { IServiceFactory, ServiceMaker } from '../../factories.ts';
import { ICtx, IServiceConfig, IService, IServiceInfo } from '../../types.ts';
import { uuid } from '../../../deps.ts';

export interface TimerConfig extends IServiceConfig {
  everySeconds: string;
}

export class Timer implements IService<TimerConfig> {
  d: Denominator | null = null;
  config: TimerConfig | null = null;

  timerId: number = 0;
  ms: number = 0;

  async info(): Promise<IServiceInfo> {
    const info: IServiceInfo = {
      name: 'Timer',
      version: '1.0.0',
      desc: 'runs Timer according to settings',
    };
    return Promise.resolve(info);
  }

  async init(): Promise<void> {
    console.log('Timer.init() config', this.config);
    if (!this.config) throw new Error('no config for timer');
    this.ms = Number.parseInt(this.config.everySeconds) * 1000;
    if (this.ms <= 0) {
      throw new Error('invalid setting for Timer');
    }
  }

  async start(): Promise<void> {
    console.log('Timer.start() config', this.config);
    this.timerId = setInterval(() => this.tick(), this.ms);
  }

  async tick(): Promise<void> {
    console.log('Timer.tick() config', this.config);
    const ctx: ICtx = {
      input: {
        kind: 'Timer:tick',
        id: uuid.generate(),
        ts: new Date(),
      },
      output: null,
    };
    const sender = {
      kind: 'Timer',
      id: this.config?.id ?? 'unknown-timer-id',
      instance: this,
    };
    if (this.d && this.d.eventManager){
      this.d.eventManager.emit('timer', ctx, sender);
    }
  }

  async stop(): Promise<void> {
    console.log('Timer.stop() config', this.config);
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  async deinit(): Promise<void> {
    console.log('Timer.deinit() config', this.config);
  }

}

const maker: ServiceMaker = () => new Timer();

export function register(factory: IServiceFactory): void {
  factory.register('timer', maker);
}
