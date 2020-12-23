import { Denominator } from './Denominator.ts';

export type JsonType = string | number | boolean | null | IJsonObject | IJsonArray;
export interface IJsonArray extends Array<JsonType> {}
export interface IJsonObject {
  [property: string]: JsonType;
}

export interface ICommonConfig extends IJsonObject {
  id: string;
}

export type EventNameType = string;

export type ServiceIdType = string;
export type ServiceIdListType = ServiceIdListType[];
export type ServicesType = Record<ServiceIdType, IDenominatorConfigService>;

export type WorkerIdType = string;
export type WorkerIdListType = WorkerIdType[];
export type WorkersType = Record<WorkerIdType, IDenominatorConfigWorker>;

export type ListenerIdType = string;
export type ListenerIdListType = string[];

export type FlowIdType = string;
export type FlowIdListType = FlowIdType[];
export type FlowsType = Record<FlowIdType, ListenerIdListType>;

export interface IDenominatorConfig {
  services: ServicesType;
  workers: WorkersType;
  flows: FlowsType;
}

export type EventFlowsType = Record<EventNameType, FlowIdListType>;

export interface IDenominatorConfigService {
  kind: string;
  config: IServiceConfig;
  events: EventFlowsType;
}

export interface IDenominatorConfigWorker {
  kind: string;
  config: IWorkerConfig;
}

export interface ICtx {
  [key: string]: any;
}

export interface IEventSender {
  kind: string;
  id: string;
  instance: IService | IWorker;
}

export interface IBasicInfo {
  name: string;
  version: string;
  desc: string;
}

export interface IInitable {
  init(): Promise<void>;
  deinit(): Promise<void>;
}

export interface IComponent<TConfig, TInfo> extends IInitable {
  d: Denominator | null;
  config: TConfig | null;
  info(): Promise<TInfo>;
}

export interface IServiceInfo extends IBasicInfo {}
export interface IServiceConfig extends ICommonConfig {}
export interface IService<
  TConfig extends IServiceConfig = IServiceConfig,
  TInfo extends IServiceInfo = IServiceInfo
> extends IComponent<TConfig, TInfo> {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface IWorkerInfo extends IBasicInfo {}
export interface IWorkerConfig extends ICommonConfig {}
export interface IWorker<
  TConfig extends IWorkerConfig = IWorkerConfig,
  TInfo extends IWorkerInfo = IWorkerInfo
> extends IComponent<TConfig, TInfo> {
  run(ctx: ICtx): Promise<void>;
}

export interface IEventListener {
  onEvent(name: string, ctx: ICtx, sender: IEventSender): Promise<void>;
}

export class WorkerEventListenerProxy implements IEventListener {
  constructor(public worker: IWorker, public senderIdFilter: RegExp = /.*/) {
    // do nothing
  }
  async onEvent(name: string, ctx: ICtx, sender: IEventSender): Promise<void> {
    if (this.senderIdFilter.test(sender.id)) {
      await this.worker.run(ctx);
    }
  }
}

export interface IEventListeners {
  [eventName: string]: IEventListener[];
}

// a worker can throw this special error to interrupt event handling flow
export class ErrCancelEvent extends Error {}
