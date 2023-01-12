import EventEmitter from 'events';
import type { AppModelInstance } from '../model/AppModel';

type AppViewEventsName = '';

export type AppViewInstance = InstanceType<typeof AppView>;

export class AppView extends EventEmitter {
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

export default AppView;
