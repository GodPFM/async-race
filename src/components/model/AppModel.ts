import EventEmitter from 'events';
import { addCar, deleteCar, getCars, updateCar } from '../../utils/loader';
import { ItemData } from '../../utils/types';
import { carsArray } from '../../utils/objectWithCars';

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
      this.emit('CAR_ADDED', undefined, result);
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
        this.emit('CAR_UPDATED', undefined, result);
      }
    }
  }

  async generateOneHundredCars() {
    const arrayWithCars = [];
    for (let i = 0; i < 100; i += 1) {
      const carNameNumber: number = this.getRandomNumber(carsArray.length - 1);
      const carModelNumber = this.getRandomNumber(carsArray[carNameNumber].model.length - 1);
      const color = this.getRandomColor();
      arrayWithCars.push({
        name: `${carsArray[carNameNumber].auto} ${carsArray[carNameNumber].model[carModelNumber]}`,
        color,
      });
    }
    arrayWithCars.forEach((el) => {
      this.addCar(el.name, el.color);
    });
  }

  async getItems(page: number, limit = 7): Promise<[[ItemData], number] | undefined> {
    const cars = await getCars(page, limit);
    if (cars) {
      return [cars[0], page];
    }
    return undefined;
  }

  getRandomNumber(to: number) {
    return Math.floor(Math.random() * (to + 1));
  }

  getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  emit(eventName: AppModelEventsName, data?: string, itemData?: ItemData) {
    return super.emit(eventName, data, itemData);
  }

  on(eventName: AppModelEventsName, callback: (data: string, itemData: ItemData) => void) {
    return super.on(eventName, callback);
  }
}
