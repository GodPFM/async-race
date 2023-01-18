import EventEmitter from 'events';
import type { AppModelInstance } from '../model/AppModel';
import garage from '../../templates/garage.html';
import car from '../../templates/car.html';
import { getCars } from '../../utils/loader';
import { ItemData } from '../../utils/types';

type GarageViewEventsName = 'CREATE_BTN_CLICK' | 'DELETE_CAR' | 'UPDATE_CAR';

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
      this.resetInputfields('create');
    });
    const updateButton = document.querySelector('.main__update-car-submit') as HTMLElement;
    updateButton?.addEventListener('click', () => {
      const newName = (document.querySelector('.main__update-car-name') as HTMLInputElement).value;
      const newColor = (document.querySelector('.main__update-car-color') as HTMLInputElement).value;
      const id = Number(updateButton.dataset.id);
      if (newName && newColor && id) {
        this.emit('UPDATE_CAR', undefined, { name: newName, color: newColor, id });
      }
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
        this.emit('DELETE_CAR', id);
      }
      if ((target as HTMLElement).classList.contains('main__car-select-btn')) {
        const { id } = (el as HTMLElement).dataset;
        const updateNameField = document.querySelector('.main__update-car-name') as HTMLInputElement;
        const updateColorField = document.querySelector('.main__update-car-color') as HTMLInputElement;
        const updateButton = document.querySelector('.main__update-car-submit') as HTMLElement;
        if (updateNameField && updateColorField && updateButton) {
          const name = el.querySelector('.main__car-name')?.textContent;
          const color = el.querySelector('.carColor')?.getAttribute('fill');
          if (name && color) {
            updateNameField.value = name;
            updateColorField.value = color;
            updateButton.dataset.id = id;
          }
        }
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

  updateCar(item: ItemData) {
    const itemOnPage = document.querySelector(`.main__race-car[data-id="${item.id}"]`);
    if (itemOnPage) {
      const name = itemOnPage.querySelector('.main__car-name');
      const color = itemOnPage.querySelector('.carColor');
      if (name && color) {
        name.textContent = item.name;
        color.setAttribute('fill', item.color);
        this.resetInputfields('update');
      }
    }
  }

  resetInputfields(field: string) {
    (document.querySelector(`.main__${field}-car-name`) as HTMLInputElement).value = '';
    (document.querySelector(`.main__${field}-car-color`) as HTMLInputElement).value = '#000000';
    if (field === 'update') {
      (document.querySelector('.main__update-car-submit') as HTMLElement).dataset.id = '';
    }
  }

  emit(eventName: GarageViewEventsName, data?: string, itemData?: { name: string; color: string; id: number }) {
    return super.emit(eventName, data, itemData);
  }

  on(
    eventName: GarageViewEventsName,
    callback: (data: string, itemData?: { name: string; color: string; id: number }) => void
  ) {
    return super.on(eventName, callback);
  }
}

export default GarageView;
