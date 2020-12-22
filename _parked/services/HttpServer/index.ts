import { http_server } from '../../../deps.ts';
import { Denominator } from '../../Denominator.ts';
import { IDemonFactory } from '../../factories';
import { ICtx, IDemon, IDemonConfig, IEventSender } from '../../types.ts';

const port = 'port';

export interface HttpServerConfig extends IDemonConfig {
  [port]: string;
}

export class HttpServer implements IDemon<HttpServerConfig> {
  d?: Denominator | null;
  config?: HttpServerConfig | null;

  server: any;

  async info() {
    return Promise.resolve({
      name: 'Http',
      version: '1.0.0',
      desc: 'runs Http server',
    });
  }

  async init(config: HttpServerConfig) {
    this.config = config;
    this.server = http_server.serve({ port: 8000 });
  }

  async start() {
    for await (const request of this.server) {
      const input: string = String(Deno.readAll(request.body));
      const output = this._handle(input);
      request.respond(output);
    }
  }

  async _handle(input: string) {
    const ctx: ICtx = { input };
    const sender: IEventSender = { kind: 'Http', id: this.config.id, instance: this };
    this.d.em.emit('http', ctx, sender);
  }

  async stop() {
    
  }

  async deinit() {
    this.d = null;
    this.config = null;
  }

}

export function register(factory: IDemonFactory) {
  factory.register('httpserver', () => new HttpServer());
}
