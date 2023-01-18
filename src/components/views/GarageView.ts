import EventEmitter from 'events';
import type { AppModelInstance } from '../model/AppModel';
import garage from '../../templates/garage.html';
import car from '../../templates/car.html';
import { ItemData } from '../../utils/types';

type GarageViewEventsName = 'CREATE_BTN_CLICK' | 'DELETE_CAR' | 'UPDATE_CAR' | 'GENERATE_CARS' | 'CHANGE_GARAGE_PAGE';

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

  build(cars: [ItemData], totalCount: number) {
    const container = document.querySelector('.main');
    if (container) {
      container.innerHTML = garage;
    }
    if (cars) {
      this.buildCars(cars);
    }
    const count = document.querySelector('.main__garage-count-number');
    if (count) {
      count.textContent = String(totalCount);
    }
    document.querySelector('.main__create-car-submit')?.addEventListener('click', () => {
      this.emit('CREATE_BTN_CLICK');
      this.resetInputfields('create');
    });
    document.querySelector('.main__race-generate')?.addEventListener('click', () => {
      this.emit('GENERATE_CARS');
    });
    document.querySelector('.main__pagination-btn--prev')?.addEventListener('click', () => {
      const number = document.querySelector('.main__page-number')?.textContent;
      if (number) this.emit('CHANGE_GARAGE_PAGE', String(Number(number) - 1));
    });
    document.querySelector('.main__pagination-btn--next')?.addEventListener('click', () => {
      const number = document.querySelector('.main__page-number')?.textContent;
      if (number) this.emit('CHANGE_GARAGE_PAGE', String(Number(number) + 1));
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
      container.innerHTML = '';
      container.append(carsTemplate.content.cloneNode(true));
    }
    const carsOnPage = document.querySelectorAll('.main__race-car');
    if (carsOnPage.length !== 0) {
      carsOnPage.forEach((el) => {
        this.addCarListener(el);
      });
    }
  }

  addCarListener(el: Element): void {
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

  buildCar(item: { name: string; color: string; id: number }): HTMLTemplateElement {
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

  addCarInPage(item: { name: string; color: string; id: number }): void {
    const template = this.buildCar(item);
    const container = document.querySelector('.main__race');
    const itemsCount = document.querySelectorAll('.main__race-car').length;
    if (container && itemsCount < 7) {
      container.append(template.content.cloneNode(true));
    }
    const count = document.querySelector('.main__garage-count-number');
    if (count) {
      count.textContent = String(Number(count.textContent) + 1);
    }
    const carOnPage = document.querySelector(`.main__race-car[data-id='${item.id}']`);
    if (carOnPage) {
      this.addCarListener(carOnPage);
    }
  }

  deleteCarFromPage(id: string): void {
    const item = document.querySelector(`.main__race-car[data-id='${id}']`);
    console.log(item, id);
    if (item) {
      item.remove();
      const count = document.querySelector('.main__garage-count-number');
      if (count) {
        count.textContent = String(Number(count.textContent) - 1);
      }
      const items = document.querySelectorAll('.main__race-car');
      if (!items.length) {
        const number = document.querySelector('.main__page-number')?.textContent;
        if (number) this.emit('CHANGE_GARAGE_PAGE', String(Number(number) - 1));
      }
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

  changePage(page: number) {
    const pageNumberSpan = document.querySelector('.main__page-number');
    if (pageNumberSpan) {
      pageNumberSpan.textContent = String(page);
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
