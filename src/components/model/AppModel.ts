import EventEmitter from 'events';
import { Paths } from '../../utils/router';

type AppModelEventsName = '';
export type AppModelInstance = InstanceType<typeof AppModel>;

export class AppModel extends EventEmitter {
  emit(eventName: string, data: string) {
    return super.emit(eventName, data);
  }

  on(eventName: string, callback: (data: string) => void) {
    return super.on(eventName, callback);
  }
}
