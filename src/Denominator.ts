import { EventManager } from './EventManager.ts';
import { InMemoryCache } from './InMemoryCache.ts';
import {
  FlowIdType, ListenerIdListType,
  IDenominatorConfig, IDenominatorConfigService, IDenominatorConfigWorker,
  IService, IServiceConfig,
  IWorker, IWorkerConfig,
  WorkerEventListenerProxy,
  ServiceIdType, WorkerIdType,
} from './types.ts';
import { ServiceFactory, WorkerFactory } from './factories.ts';

const ERR_NO_CONFIG          = 'Denominator has no config';
const ERR_NO_SERVICE_FACTORY = 'Denominator has no service factory';
const ERR_NO_WORKER_FACTORY  = 'Denominator has no worker factory';
const ERR_NO_EVENT_MANAGER   = 'Denominator has no event manager';
const ERR_NO_CONFIG_SERVICES = 'Denominator config has no services';
const ERR_NO_CONFIG_WORKERS  = 'Denominator config has no workers';
const ERR_NO_CONFIG_FLOWS    = 'Denominator config has no flows';

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
    console.log('Denominator.loadConfig()');
    const configJson = await Deno.readTextFile(configFile);
    this.validate(configJson);
  }

  validate(configJson: string): void {
    console.log('Denominator.validate()');
    // TODO: use JSON schema to validate config
    this.config = JSON.parse(configJson);
    if (!this.config) throw new Error(ERR_NO_CONFIG);
  }

  getConfig(): IDenominatorConfig {
    if (!this.config) throw new Error(ERR_NO_CONFIG);
    return this.config;
  }

  getConfigServicesEntries(): Array<[ServiceIdType, IDenominatorConfigService]> {
    const c = this.getConfig();
    return Object.getOwnPropertyNames(c.services).map(id => ([id, c.services[id]]));
  }

  getConfigWorkersEntries(): Array<[WorkerIdType, IDenominatorConfigWorker]> {
    const c = this.getConfig();
    return Object.getOwnPropertyNames(c.workers).map(id => ([id, c.workers[id]]));
  }

  async init(): Promise<void> {
    console.log('Denominator.init()');
    if (!this.config) throw new Error(ERR_NO_CONFIG);
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
    if (this.services[id]) return this.services[id];
    throw new Error(`Service [id: ${id}] not found!`);
  }

  getServicesEntries(): Array<[string, IService]> {
    return this.getServicesIds().map(id => [id, this.services[id]]);
  }

  getServiceFactory(): ServiceFactory {
    if (this.serviceFactory) return this.serviceFactory;
    throw new Error(ERR_NO_SERVICE_FACTORY);
  }

  makeServices(): void {
    console.log('Denominator.makeServices()');
    const sf = this.getServiceFactory();
    this.services = {};
    for (const [id, serviceConfig] of this.getConfigServicesEntries()) {
      const service = sf.make(serviceConfig.kind);
      service.d = this;
      service.config = { ...serviceConfig.config, id } as IServiceConfig;
      this.services[id] = service;
    }
  }

  async initServices(): Promise<void> {
    console.log('Denominator.initServices()');
    for (const [id, service] of this.getServicesEntries()) {
      await service.init();
    }
  }

  async deinitServices(): Promise<void> {
    for (const [id, service] of this.getServicesEntries()) {
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
    if (this.workers[id]) return this.workers[id];
    throw new Error(`Worker [id: ${id}] not found!`);
  }

  getWorkerFactory(): WorkerFactory {
    if (this.workerFactory) return this.workerFactory;
    throw new Error(ERR_NO_WORKER_FACTORY);
  }

  makeWorkers(): void {
    console.log('Denominator.makeWorkers()');
    const wf = this.getWorkerFactory();
    this.workers = {};
    for (const [id, workerConfig] of this.getConfigWorkersEntries()) {
      const worker = wf.make(workerConfig.kind);
      worker.d = this;
      worker.config = { ...workerConfig.config, id } as IWorkerConfig;
      this.workers[id] = worker;
    }
  }

  async initWorkers() {
    console.log('Denominator.initWorkers()');
    for (const [id, worker] of this.getWorkersEntries()) {
      await worker.init();
    }
  }

  async deinitWorkers() {
    for (const [id, worker] of this.getWorkersEntries()) {
      await worker.deinit();
      worker.d = null;
      worker.config = null;
      delete this.workers[id];
    }
  }

  getConfigFlowsEntries(): Array<[FlowIdType, ListenerIdListType]> {
    const c = this.getConfig();
    if (c.flows) return Object.getOwnPropertyNames(c.flows).map(id => ([id, c.flows[id]]));
    throw new Error(ERR_NO_CONFIG_FLOWS);
  }

  getConfigFlow(id: FlowIdType): ListenerIdListType {
    const c = this.getConfig();
    if (c.flows && c.flows[id]) return c.flows[id];
    throw new Error(`Flow [id: ${id}] not found`);
  }

  getEventManager(): EventManager {
    if (this.eventManager) return this.eventManager;
    throw new Error(ERR_NO_EVENT_MANAGER);
  }

  getFlowWorkers(flowId: FlowIdType): IWorker[] {
    const result: IWorker[] = [];
    const listenerIdList = this.getConfigFlow(flowId);
    for (const listenerId of listenerIdList) {
      const worker = this.getWorker(listenerId);
      result.push(worker);
    }
    return result;
  }

  makeFlowListeners(flowId: FlowIdType, senderId: string): WorkerEventListenerProxy[] {
    const result: WorkerEventListenerProxy[] = [];
    for (const worker of this.getFlowWorkers(flowId)) {
      result.push(new WorkerEventListenerProxy(worker, new RegExp(senderId, 'ig')));
    }
    return result;
  }

  registerEventListeners() {
    console.log('Denominator.registerEventListeners()');
    const em = this.getEventManager();
    for (const [serviceId, serviceConfig] of this.getConfigServicesEntries()) {
      const eventNames = Object.getOwnPropertyNames(serviceConfig.events);
      for (const eventName of eventNames) {
        const flowIdList = serviceConfig.events[eventName];
        for (const flowId of flowIdList) {
          const listeners = this.makeFlowListeners(flowId, serviceId);
          for (const listener of listeners) {
            em.on(eventName, listener);
          }
        }
      }
    }
  }

  async start() {
    console.log('Denominator.start()');
    // start all services
    for (let [id, service] of this.getServicesEntries()) {
      await service.start();
    }
  }

  async stop() {
    console.log('Denominator.stop()');
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
