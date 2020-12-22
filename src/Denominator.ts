import { EventManager } from './EventManager.ts';
import { InMemoryCache } from './InMemoryCache.ts';
import { IService, IDenominatorConfig, IWorker, WorkerEventListenerProxy } from './types.ts';
import { ServiceFactory, WorkerFactory } from './factories.ts';

export class Denominator {
  config: IDenominatorConfig | null = null;
  eventManager: EventManager | null = null;
  cache: InMemoryCache | null = null;
  serviceFactory: ServiceFactory | null = null;
  workerFactory: WorkerFactory | null = null;
  services: Record<string, IService> = {};
  workers: Record<string, IWorker> = {};

  signalHandle?: any;

  async loadConfig(configFile: string): Promise<void> {
    const configJson = await Deno.readTextFile(configFile);
    this.config = JSON.parse(configJson);
  }

  async init(): Promise<void> {
    if (!this.config) throw new Error('Denominator has no config');
    this.eventManager = new EventManager();
    await this.eventManager.init();

    this.cache = new InMemoryCache();
    await this.cache.init();

    this.serviceFactory = new ServiceFactory();
    await this.serviceFactory.init();
    
    this.workerFactory = new WorkerFactory();
    await this.workerFactory.init();
    
    this.makeServices();
    await this.initServices();

    this.makeWorkers();
    await this.initWorkers();

    this.registerEventListeners();
  }

  getServicesIds(): string[] {
    return Object.getOwnPropertyNames(this.services);
  }

  getService(id: string): IService {
    if (this.services[id]) {
      return this.services[id];
    }
    throw new Error(`Service [id: ${id}] not found!`);
  }

  getServicesEntries(): Array<[string, IService]> {
    return this.getServicesIds().map(id => [id, this.services[id]]);
  }

  makeServices(): void {
    if (!this.config) throw new Error('Denominator has no config');
    if (!this.serviceFactory) throw new Error('Denominator has no service factory');
    this.services = {};
    for (let item of this.config.services) {
      const service = this.serviceFactory.make(item.kind);
      service.d = this;
      service.config = item.config;
      const { id } = item.config;
      this.services[id] = service;
    }
  }

  async initServices(): Promise<void> {
    for (let id of this.getServicesIds()) {
      const service = this.services[id];
      await service.init();
    }
  }

  async deinitServices(): Promise<void> {
    for (let id of this.getServicesIds()) {
      const service = this.services[id];
      await service.deinit();
      service.d = null;
      service.config = null;
      delete this.services[id];
    }
  }

  getWorkersIds(): string[] {
    return Object.getOwnPropertyNames(this.workers);
  }

  getWorkersEntries(): Array<[string, IWorker]> {
    return this.getWorkersIds().map(id => [id, this.workers[id]]);
  }

  getWorker(id: string): IWorker {
    if (this.workers[id]) {
      return this.workers[id];
    }
    throw new Error(`Worker [id: ${id}] not found!`);
  }

  makeWorkers(): void {
    if (!this.config) throw new Error('Denominator has no config');
    if (!this.workerFactory) throw new Error('Denominator has no worker factory');
    this.workers = {};
    for (let item of this.config.workers) {
      const worker = this.workerFactory.make(item.kind);
      worker.d = this;
      worker.config = item.config;
      const { id } = item.config;
      this.workers[id] = worker;
    }
  }

  async initWorkers() {
    for (let id of this.getWorkersIds()) {
      const worker = this.workers[id];
      await worker.init();
    }
  }

  async deinitWorkers() {
    for (let id of this.getWorkersIds()) {
      const worker = this.workers[id];
      await worker.deinit();
      worker.d = null;
      worker.config = null;
      delete this.workers[id];
    }
  }

  registerEventListeners() {
    if (!this.config) throw new Error('Denominator has no config');
    if (!this.eventManager) throw new Error('Denominator has no event manager');
    const em = this.eventManager;
    for (let item of this.config.events) {
      const { name, listeners, sender } = item;
      listeners.forEach(id => {
        const worker = this.getWorker(id);
        const elObj = new WorkerEventListenerProxy(worker, new RegExp(sender, 'ig'))
        em.on(name, elObj);
      });
    }
  }

  async start() {
    // start all services
    for (let [id, service] of this.getServicesEntries()) {
      await service.start();
    }
  }

  async stop() {
    // stop all services
    for (let [id, service] of this.getServicesEntries()) {
      await service.stop();
    }
  }

  async deinit() {
    await this.deinitServices();
    await this.deinitWorkers();
    this.config = null;
    this.eventManager = null;
    this.cache = null;
    this.serviceFactory = null;
    this.workerFactory = null;
  }
}
