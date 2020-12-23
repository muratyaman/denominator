import { ICtx, IEventSender, IEventListener, IEventListeners, IInitable, ErrCancelEvent } from './types.ts';

export class EventManager implements IInitable {

  el: IEventListeners = {};

  async init() {

  }

  async deinit() {
    this.el = {};
  }

  on(name: string, listener: IEventListener): number {
    console.log('EventManager.on()', name);
    const n = name.toLocaleLowerCase();
    if (!this.el[n]) this.el[n] = []; // init event
    this.el[n].push(listener);
    return this.el[n].length;
  }

  off(name: string, idx: number) {
    const n = name.toLocaleLowerCase();
    if (!this.el[n]) throw new Error('unknown event: ' + n);
    if (!this.el[n][idx]) throw new Error('unknown event listener: ' + n + ' id: ' + idx);
    delete this.el[n][idx];
  }

  async emit(name: string, ctx: ICtx, sender: IEventSender) {
    console.log('EventManager.emit()', name);
    const n = name.toLocaleLowerCase();
    if (!this.el[n]) {
      return; // no listeners, it's OK
    }
    for (let listenerObj of this.el[n]) {
      try {
        await listenerObj.onEvent(n, ctx, sender);
      } catch (err) {
        if (err instanceof ErrCancelEvent) {
          break; // ignore special error, just exit loop
        } else {
          throw err;
        }
      }
    }
  }
}
