import * as services from './services/index.ts';
import * as workers from './workers/index.ts';
import { IService, IWorker } from './types.ts';

export interface IMaker<T> {
  (): T;
}
export type ServiceMaker = IMaker<IService>;
export type WorkerMaker = IMaker<IWorker>;

export interface IFactory<T> {
  data: Record<string, IMaker<T>>;
  register(name: string, maker: IMaker<T>): void;
  make(name: string): T;
}

export class BaseFactory<T> {
  data: Record<string, IMaker<T>> = {};
  register(name: string, maker: IMaker<T>): void {
    this.data[name.toLowerCase()] = maker;
  }
  make(name: string): T {
    const maker = this.data[name.toLowerCase()];
    return maker();
  }
}

export interface IServiceFactory extends IFactory<IService> {}
export class ServiceFactory extends BaseFactory<IService> implements IServiceFactory {
  async init() {
    services.timer.register(this);
  }
}

export interface IWorkerFactory extends IFactory<IWorker> {}
export class WorkerFactory extends BaseFactory<IWorker> implements IWorkerFactory {
  async init() {
    workers.consolelogger.register(this);
    workers.copy.register(this);
    workers.counter.register(this);
    workers.parallelflow.register(this);
    workers.serialflow.register(this);
    workers.id.register(this);
    workers.timestamp.register(this);
  }
}
