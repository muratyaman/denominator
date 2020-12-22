import { IInitable, JsonType } from './types.ts';

export class InMemoryCache implements IInitable {
  
  data: Record<string, string> = {};

  async init() {

  }

  async deinit() {
    this.data = {};
  }

  set(k: string, v: JsonType) {
    this.data[k] = JSON.stringify(v);
  }

  del(k: string) {
    delete this.data[k];
  }

  get(k: string): JsonType {
    return this.data[k] ? JSON.parse(this.data[k]) : null;
  }
}
