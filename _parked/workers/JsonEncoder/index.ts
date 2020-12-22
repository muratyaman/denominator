import { Denominator } from '../../Denominator.ts';
import { ICtx, IOp, IOpConfig } from '../../types.ts';
import { IOpFactory } from '../../factories.ts';

export interface JsonEncoderConfig extends IOpConfig {

}

export class JsonEncoder implements IOp<JsonEncoderConfig> {
  d?: Denominator | null;
  config?: JsonEncoderConfig | null;

  async info() {
    return Promise.resolve({
      name: 'JsonEncoder',
      version: '1.0.0',
      desc: 'sets ctx.output using JSON.stringify()',
    })
  }

  async init(config: JsonEncoderConfig) {
    this.config = config;
  }

  async run(ctx: ICtx) {
    ctx['output'] = JSON.stringify(ctx['output'] ?? {});
  }

  async deinit() {
    this.d = null;
    this.config = null;
  }

}

export function register(factory: IOpFactory) {
  factory.register('jsonencoder', () => new JsonEncoder());
}
