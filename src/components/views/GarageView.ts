import EventEmitter from 'events';
import type { AppModelInstance } from '../model/AppModel';
import garage from '../../templates/garage.html';
import car from '../../templates/car.html';
import { getCars } from '../../utils/loader';

type GarageViewEventsName = '';

type CarsResponce = {
  name: string;
  color: string;
  id: number;
};

type CarsType = Array<CarsResponce>;

export type GarageViewInstance = InstanceType<typeof GarageView>;

export class GarageView extends EventEmitter {
  private model: AppModelInstance;

  constructor(model: AppModelInstance) {
    super();
    this.model = model;
  }

  async build() {
    const container = document.querySelector('.main');
    if (container) {
      container.innerHTML = garage;
    }
    const cars = await getCars(1);
    if (cars && cars.length !== 0) {
      this.buildCars(cars);
    }
  }

  buildCars(cars: CarsType) {
    const container = document.querySelector('.main__race');
    const carsTemplate = document.createElement('template');
    cars.forEach((el) => {
      const carTemplate = document.createElement('template');
      carTemplate.innerHTML = car;
      const name = carTemplate.content.querySelector('.main__car-name');
      const color = carTemplate.content.querySelector('.carColor');
      const carContainer = carTemplate.content.querySelector('.main__race-car') as HTMLElement;
      if (name) {
        name.textContent = el.name;
      }
      if (color) {
        color.setAttribute('fill', el.color);
      }
      if (carContainer) {
        carContainer.dataset.id = String(el.id);
      }
      carsTemplate.content.append(carTemplate.content);
    });
    console.log(carsTemplate);
    if (container) {
      container.append(carsTemplate.content.cloneNode(true));
    }
  }

  emit(eventName: string) {
    return super.emit(eventName);
  }

  on(eventName: string, callback: (data: string) => void) {
    return super.on(eventName, callback);
  }
}

export default GarageView;
