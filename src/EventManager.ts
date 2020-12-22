import { ICtx, IEventSender, IEventListener, IEventListeners, IInitable } from './types.ts';

export class EventManager implements IInitable {

  el: IEventListeners = {};

  async init() {

  }

  async deinit() {
    this.el = {}
  }

  on(en: string, listener: IEventListener): number {
    if (!this.el[en]) this.el[en] = []; // init event
    this.el[en].push(listener);
    return this.el[en].length;
  }

  off(en: string, idx: number) {
    if (!this.el[en]) throw new Error('unknown event: ' + en);
    if (!this.el[en][idx]) throw new Error('unknown event listener: ' + en + ' id: ' + idx);
    delete this.el[en][idx];
  }

  async emit(en: string, ctx: ICtx, sender: IEventSender) {
    if (!this.el[en]) {
      return; // no listeners, it's OK
    }
    for (let listenerObj of this.el[en]) {
      const result = await listenerObj.onEvent(en, ctx, sender);
      if (!result) break; // exit loop
    }
  }

}
