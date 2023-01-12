import EventEmitter from 'events';
import type { AppModelInstance } from '../model/AppModel';

type WinnersViewEventsName = '';

export type WinnersViewInstance = InstanceType<typeof WinnersView>;

export class WinnersView extends EventEmitter {
  private model: AppModelInstance;

  constructor(model: AppModelInstance) {
    super();
    this.model = model;
  }

  emit(eventName: string) {
    return super.emit(eventName);
  }

  on(eventName: string, callback: (data: string) => void) {
    return super.on(eventName, callback);
  }
}
