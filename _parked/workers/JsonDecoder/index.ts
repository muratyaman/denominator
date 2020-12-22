import { Denominator } from '../../Denominator.ts';
import { ICtx, IOp, IOpConfig } from '../../types.ts';
import { IOpFactory } from '../../factories.ts';

export interface JsonDecoderConfig extends IOpConfig {

}

export class JsonDecoder implements IOp<JsonDecoderConfig> {
  d?: Denominator | null;
  config?: JsonDecoderConfig | null;

  async info() {
    return Promise.resolve({
      name: 'JsonDecoder',
      version: '1.0.0',
      desc: 'sets ctx.input using JSON.parse()',
    })
  }

  async init(config: JsonDecoderConfig) {
    this.config = config;
  }

  async run(ctx: ICtx) {
    ctx['input'] = JSON.parse(ctx['input'] ?? '{}');
  }

  async deinit() {
    this.d = null;
    this.config = null;
  }

}
export function register(factory: IOpFactory) {
  factory.register('jsondecoder', () => new JsonDecoder());
}
