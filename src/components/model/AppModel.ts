import EventEmitter from 'events';
import * as stream from 'stream';
import { addCar } from '../../utils/loader';

type AppModelEventsName = 'CHANGE_PAGE' | 'CAR_ADDED';
export type AppModelInstance = InstanceType<typeof AppModel>;

export class AppModel extends EventEmitter {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    super();
  }

  changePage(page: string) {
    this.emit('CHANGE_PAGE', page);
  }

  async addCar(name: string, color: string) {
    const result = await addCar(name, color);
    if (result) {
      const objectWithData = await result.json();
      this.emit('CAR_ADDED', undefined, objectWithData);
    }
  }

  emit(eventName: AppModelEventsName, data?: string, itemData?: { name: string; color: string; id: number }) {
    return super.emit(eventName, data, itemData);
  }

  on(
    eventName: AppModelEventsName,
    callback: (data: string, itemData: { name: string; color: string; id: number }) => void
  ) {
    return super.on(eventName, callback);
  }
}
