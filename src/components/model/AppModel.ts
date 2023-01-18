import EventEmitter from 'events';
import { addCar, deleteCar, updateCar } from '../../utils/loader';
import { ItemData } from '../../utils/types';

type AppModelEventsName = 'CHANGE_PAGE' | 'CAR_ADDED' | 'CAR_DELETED' | 'CAR_UPDATED';
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

  async removeCar(id: string) {
    const result = await deleteCar(id);
    if (result) {
      this.emit('CAR_DELETED', id);
    }
  }

  async updateCar(itemData?: ItemData) {
    if (itemData) {
      const result = await updateCar(itemData);
      if (result) {
        const object = await result.json();
        this.emit('CAR_UPDATED', undefined, object);
      }
    }
  }

  emit(eventName: AppModelEventsName, data?: string, itemData?: ItemData) {
    return super.emit(eventName, data, itemData);
  }

  on(eventName: AppModelEventsName, callback: (data: string, itemData: ItemData) => void) {
    return super.on(eventName, callback);
  }
}
