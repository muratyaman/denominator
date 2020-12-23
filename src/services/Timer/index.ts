import { Denominator } from '../../Denominator.ts';
import { IServiceFactory, ServiceMaker } from '../../factories.ts';
import { ICtx, IServiceConfig, IService, IServiceInfo } from '../../types.ts';

const ERR_NO_CONFIG = 'Timer service has no config';
const ERR_NO_DENOMINATOR = 'Timer service has no denominator';
const ERR_INVALID_CONFIG_EVERY_SECS = 'Timer service setting "everySeconds" is invalid';

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
      desc: 'runs Timer service according to settings',
    };
    return Promise.resolve(info);
  }

  async init(): Promise<void> {
    console.log('Timer.init()');
    const c = this.getConfig();
    this.ms = Number.parseInt(c.everySeconds) * 1000;
    if (this.ms <= 0) throw new Error(ERR_INVALID_CONFIG_EVERY_SECS);
  }

  getConfig(): TimerConfig {
    if (this.config) return this.config;
    throw new Error(ERR_NO_CONFIG);
  }

  async start(): Promise<void> {
    console.log('Timer.start()');
    this.timerId = setInterval(() => this.tick(), this.ms);
  }

  getDenominator(): Denominator {
    if (this.d) return this.d;
    throw new Error(ERR_NO_DENOMINATOR);
  }

  async tick(): Promise<void> {
    console.log('Timer.tick()');
    const c = this.getConfig();
    const ctx: ICtx = {
      input: new Date(),
      output: null,
    };
    const sender = { kind: 'Timer', id: c.id, instance: this };
    const em = this.getDenominator().getEventManager();
    em.emit('Timer_tick', ctx, sender);
  }

  async stop(): Promise<void> {
    if (this.timerId) clearInterval(this.timerId);
  }

  async deinit(): Promise<void> {
    
  }

}

const maker: ServiceMaker = () => new Timer();

export function register(factory: IServiceFactory): void {
  factory.register('timer', maker);
}
