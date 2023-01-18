import EventEmitter from 'events';
import type { AppModelInstance } from '../model/AppModel';
import garage from '../../templates/garage.html';
import car from '../../templates/car.html';
import { getCars } from '../../utils/loader';

type GarageViewEventsName = 'CREATE_BTN_CLICK' | 'DELETE_CAR';

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
    const carsOnPage = document.querySelectorAll('.main__race-car');
    if (carsOnPage.length !== 0) {
      carsOnPage.forEach((el) => {
        this.addCarListener(el);
      });
    }
  }

  addCarListener(el: Element) {
    el.addEventListener('click', (e) => {
      const { target } = e;
      console.log(target);
      if ((target as HTMLElement).classList.contains('main__car-remove-btn')) {
        const { id } = (el as HTMLElement).dataset;
        console.log(id);
        this.emit('DELETE_CAR', id);
      }
    });
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
    const carOnPage = document.querySelector(`.main__race-car[data-id='${item.id}']`);
    if (carOnPage) {
      this.addCarListener(carOnPage);
    }
  }

  deleteCarFromPage(id: string) {
    const item = document.querySelector(`.main__race-car[data-id='${id}']`);
    console.log(item, id);
    if (item) {
      item.remove();
    }
  }

  emit(eventName: GarageViewEventsName, data?: string) {
    return super.emit(eventName, data);
  }

  on(eventName: GarageViewEventsName, callback: (data: string) => void) {
    return super.on(eventName, callback);
  }
}

export default GarageView;
