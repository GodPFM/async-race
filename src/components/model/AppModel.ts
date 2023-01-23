import EventEmitter from 'events';
import {
  addCar,
  carStart,
  createWinner,
  deleteCar,
  getCars,
  getWinner,
  getWinners,
  startEngine,
  stopEngine,
  updateCar,
  updateWinnerInfo,
} from '../../utils/loader';
import { CarParam, ItemData, WinnerParams } from '../../utils/types';
import { carsArray } from '../../utils/objectWithCars';

type AppModelEventsName =
  | 'CHANGE_PAGE'
  | 'CAR_ADDED'
  | 'CAR_DELETED'
  | 'CAR_UPDATED'
  | 'ENGINE_START_SUCCESS'
  | 'GET_CARS_FOR_CHANGE_PAGE'
  | 'CAR_RESETED'
  | 'CAR_READY'
  | 'WINNERS_READY';
export type AppModelInstance = InstanceType<typeof AppModel>;

export class AppModel extends EventEmitter {
  public isWinnerInRace: boolean;

  public sortBy: string;

  public order: string;

  constructor() {
    super();
    this.isWinnerInRace = false;
    this.sortBy = '';
    this.order = '';
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
    await Promise.allSettled(
      arrayWithCars.map(async (el) => {
        await this.addCar(el.name, el.color);
      })
    );
    return true;
  }

  async getItems(page: number, limit = 7) {
    const cars = await getCars(page, limit);
    if (cars) {
      this.emit('GET_CARS_FOR_CHANGE_PAGE', String(page), cars[0]);
    }
  }

  async addWinner(id: string, time: number | undefined) {
    if (time) {
      const checkWinner: WinnerParams | boolean | null = await getWinner(id);
      const convertedTime = (time / 1000).toFixed(2);
      if (!checkWinner) {
        const winnerParams: WinnerParams = {
          id: Number(id),
          wins: 1,
          time: Number(convertedTime),
        };
        const createWinnerRequest = await createWinner(winnerParams);
      }
      if (checkWinner && typeof checkWinner !== 'boolean') {
        checkWinner.wins += 1;
        if (checkWinner.time > Number(convertedTime)) {
          checkWinner.time = Number(convertedTime);
        }
        const updateCarResponse = await updateWinnerInfo(checkWinner);
      }
    }
  }

  getRandomNumber(to: number) {
    return Math.floor(Math.random() * (to + 1));
  }

  getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  async startCarEngine(id: string, isRaceAll: boolean): Promise<CarParam | null> {
    const result = await startEngine(id);
    if (result) {
      this.emit('CAR_READY', id, undefined, result, isRaceAll);
      return result;
    }
    return null;
  }

  async startCarRace(id: string) {
    this.isWinnerInRace = false;
    const result = await carStart(id);
    return result;
  }

  async resetCar(id: string, isAll: boolean) {
    const result = await stopEngine(id, isAll);
    if (result) {
      this.emit('CAR_RESETED', id);
      return true;
    }
    return false;
  }

  async getWinners(page: string) {
    return getWinners(this.sortBy, this.order, page);
  }

  async changeWinnersTable(page: number, tableCell: string, isPagination: boolean) {
    if (!isPagination) {
      if (this.sortBy === tableCell) {
        if (this.order === 'DESC') {
          this.order = 'ASC';
        } else {
          this.order = 'DESC';
        }
      } else {
        this.sortBy = tableCell;
        this.order = 'ASC';
      }
    }
    const result = await getWinners(this.sortBy, this.order, String(page));
    if (result) {
      this.emit('WINNERS_READY', undefined, undefined, undefined, undefined, result[0]);
    }
  }

  emit(
    eventName: AppModelEventsName,
    data?: string,
    itemData?: ItemData | ItemData[],
    carParams?: CarParam,
    isRaceAll?: boolean,
    winnersData?: Awaited<WinnerParams & ItemData>[]
  ) {
    return super.emit(eventName, data, itemData, carParams, isRaceAll, winnersData);
  }

  on(
    eventName: AppModelEventsName,
    callback: (
      data: string,
      itemData: ItemData | ItemData[],
      carParams: CarParam,
      isRaceAll: boolean,
      winnersData: Awaited<WinnerParams & ItemData>[]
    ) => void
  ) {
    return super.on(eventName, callback);
  }
}
