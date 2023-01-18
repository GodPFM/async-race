import EventEmitter from 'events';
import type { AppModelInstance } from '../model/AppModel';
import garage from '../../templates/garage.html';
import car from '../../templates/car.html';
import { getCars } from '../../utils/loader';

type GarageViewEventsName = 'CREATE_BTN_CLICK';

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

  build(cars: CarsType) {
    const container = document.querySelector('.main');
    if (container) {
      container.innerHTML = garage;
    }
    if (cars && cars.length !== 0) {
      this.buildCars(cars);
    }
    const createButton = document.querySelector('.main__create-car-submit');
    createButton?.addEventListener('click', () => {
      this.emit('CREATE_BTN_CLICK');
    });
  }

  buildCars(cars: CarsType) {
    const container = document.querySelector('.main__race');
    const carsTemplate = document.createElement('template');
    cars.forEach((el) => {
      const carTemplate = this.buildCar(el);
      carsTemplate.content.append(carTemplate.content);
    });
    if (container) {
      container.append(carsTemplate.content.cloneNode(true));
    }
  }

  buildCar(item: { name: string; color: string; id: number }) {
    const carTemplate = document.createElement('template');
    carTemplate.innerHTML = car;
    const name = carTemplate.content.querySelector('.main__car-name');
    const color = carTemplate.content.querySelector('.carColor');
    const carContainer = carTemplate.content.querySelector('.main__race-car') as HTMLElement;
    if (name) {
      name.textContent = item.name;
    }
    if (color) {
      color.setAttribute('fill', item.color);
    }
    if (carContainer) {
      carContainer.dataset.id = String(item.id);
    }
    return carTemplate;
  }

  addCarInPage(item: { name: string; color: string; id: number }) {
    const template = this.buildCar(item);
    const container = document.querySelector('.main__race');
    if (container) {
      container.append(template.content.cloneNode(true));
    }
  }

  emit(eventName: GarageViewEventsName) {
    return super.emit(eventName);
  }

  on(eventName: GarageViewEventsName, callback: (data: string) => void) {
    return super.on(eventName, callback);
  }
}

export default GarageView;
