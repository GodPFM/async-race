import EventEmitter from 'events';
import type { AppModelInstance } from '../model/AppModel';
import garage from '../../templates/garage.html';
import car from '../../templates/car.html';
import { CarParam, ItemData } from '../../utils/types';

type GarageViewEventsName =
  | 'CREATE_BTN_CLICK'
  | 'DELETE_CAR'
  | 'UPDATE_CAR'
  | 'GENERATE_CARS'
  | 'CHANGE_GARAGE_PAGE'
  | 'CAR_START'
  | 'START_ENGINE'
  | 'SWITCH_DRIVE_MODE'
  | 'CAR_RESET'
  | 'CAR_RESET_ALL'
  | 'CAR_START_ALL'
  | 'WINNER_FOUND';

type CarsResponce = {
  name: string;
  color: string;
  id: number;
};

type AnimationCarData = {
  [key: string]: number;
};

type CarsType = Array<CarsResponce>;

export type GarageViewInstance = InstanceType<typeof GarageView>;

export class GarageView extends EventEmitter {
  private model: AppModelInstance;

  private animationCarData: AnimationCarData;

  constructor(model: AppModelInstance) {
    super();
    this.model = model;
    this.animationCarData = {} as AnimationCarData;
    model.on('GET_CARS_FOR_CHANGE_PAGE', (data, cars) => {
      if (Array.isArray(cars)) {
        this.changePage(Number(data));
        this.buildCars(cars);
      } else {
        console.error('Cars is not Array');
      }
    });
    model.on('CAR_ADDED', (data, itemData) => {
      if (!Array.isArray(itemData)) {
        this.addCarInPage(itemData);
      }
    });
    model.on('CAR_UPDATED', (data, itemData, carParams) => {
      if (!Array.isArray(itemData)) {
        this.updateCar(itemData);
      } else {
        console.error('itemData is array');
      }
    });
    model.on('CAR_DELETED', (data) => {
      this.deleteCarFromPage(data);
      const page = document.querySelector('.main__page-number');
      const items = document.querySelectorAll('.main__race-car');
      if (page) {
        if (!items.length) {
          this.emit('CHANGE_GARAGE_PAGE', String(Number(page.textContent) - 1));
        }
        this.emit('CHANGE_GARAGE_PAGE', String(page.textContent));
      }
    });
    model.on('CAR_RESETED', (data) => {
      this.resetCar(data);
    });
    model.on('CAR_READY', (data, itemData, carParams, isRaceAll) => {
      console.log('emitted', isRaceAll);
      if (isRaceAll !== undefined) {
        console.log(data, carParams, isRaceAll);
        this.prepareCar(data, carParams, isRaceAll);
      }
    });
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
    document.querySelector('.main__race-reset')?.addEventListener('click', () => {
      const carItems = document.querySelectorAll('.main__race-car');
      if (carItems) {
        this.emit('CAR_RESET_ALL', undefined, undefined, carItems);
      }
    });
    document.querySelector('.main__race-start')?.addEventListener('click', () => {
      const carItems = document.querySelectorAll('.main__race-car');
      if (carItems) {
        this.emit('CAR_START_ALL', undefined, undefined, carItems);
      }
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
      const { id } = (el as HTMLElement).dataset;
      if ((target as HTMLElement).classList.contains('main__car-remove-btn')) {
        this.emit('DELETE_CAR', id);
      }
      if ((target as HTMLElement).classList.contains('main__car-select-btn')) {
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
      if ((target as HTMLElement).classList.contains('main__car-start')) {
        const button = target as HTMLButtonElement;
        button.disabled = true;
        this.emit('START_ENGINE', id);
      }
      if ((target as HTMLElement).classList.contains('main__car-stop')) {
        const button = target as HTMLButtonElement;
        button.disabled = true;
        this.emit('CAR_RESET', id);
      }
    });
  }

  buildCar(item: ItemData): HTMLTemplateElement {
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

  prepareCar(id: string, carParams: CarParam, isRaceAll: boolean) {
    console.log('test');
    const item = document.querySelector(`.main__race-car[data-id="${id}"`) as HTMLElement;
    if (item) {
      item.dataset.velocity = String(carParams.velocity);
      item.dataset.distance = String(carParams.distance);
      if (!isRaceAll) {
        this.emit('SWITCH_DRIVE_MODE', id);
      }
    }
  }

  carDrive(id: string, isSuccess: boolean, isRace: boolean) {
    const item = document.querySelector(`.main__race-car[data-id="${id}"`) as HTMLElement;
    if (item) {
      const velocity = Number(item.dataset.velocity);
      const distance = Number(item.dataset.distance);
      let name = item.querySelector('.main__car-name')?.textContent;
      item.querySelector('.main__car-start')?.classList.add('ready');
      (item.querySelector('.main__car-stop') as HTMLButtonElement).disabled = false;
      const carContainer = item.querySelector('.main__car-images') as HTMLElement;
      const carFireImage = item.querySelector('.main__car-fire') as HTMLElement;
      if (carContainer) {
        let start: number | null = null;
        const randNumber = Math.floor(Math.random() * (80 - 20) + 20);
        const singleCarAnimation = (time: DOMHighResTimeStamp) => {
          if (!start) start = time;
          const progress = time - start;
          let leftNewValue = (progress * velocity) / (distance / 100);
          if (isSuccess) {
            if (leftNewValue > 100) {
              leftNewValue = 100;
              if (isRace) {
                if (!name) {
                  name = '';
                }
                this.emit('WINNER_FOUND', id, { name, color: '', id: Number(id), time: progress });
              }
            }
          } else if (leftNewValue > randNumber) {
            leftNewValue = randNumber;
            if (carFireImage) {
              carFireImage.hidden = false;
            }
          }
          carContainer.style.left = String(`${leftNewValue}%`);
          if ((leftNewValue < 100 && isSuccess) || (leftNewValue < randNumber && !isSuccess)) {
            this.animationCarData[id] = requestAnimationFrame(singleCarAnimation);
          }
        };
        this.animationCarData[id] = window.requestAnimationFrame(singleCarAnimation);
      }
    }
  }

  showModalWindow(action: string, itemData?: ItemData) {
    const modalWindow = document.querySelector('.modal-window');
    if (modalWindow) {
      const message = modalWindow.querySelector('.modal-window__message');
      if (action === 'loading') {
        if (message) {
          message.textContent = 'Loading';
          modalWindow.classList.toggle('hidden');
        }
      }
      if (action === 'winner') {
        if (itemData?.time && message) {
          message.textContent = `Winner is ${itemData.name} with time ${(itemData.time / 1000).toFixed(2)} s`;
        }
        modalWindow.classList.remove('hidden');
        setTimeout(() => modalWindow.classList.add('hidden'), 3000);
      }
    }
  }

  resetCar(id: string) {
    const carRequestId = this.animationCarData[id];
    window.cancelAnimationFrame(carRequestId);
    const item = document.querySelector(`.main__race-car[data-id="${id}"`) as HTMLElement;
    const carContainer = item.querySelector('.main__car-images') as HTMLElement;
    const carFireImage = item.querySelector('.main__car-fire') as HTMLElement;
    const startBtn = item.querySelector('.main__car-start') as HTMLButtonElement;
    const stopBtn = item.querySelector('.main__car-stop') as HTMLButtonElement;
    if (startBtn && stopBtn) {
      startBtn.disabled = false;
      startBtn.className = 'main__car-start';
      stopBtn.disabled = true;
    }
    if (carContainer) {
      carContainer.style.left = '0%';
    }
    if (carFireImage) {
      carFireImage.hidden = true;
    }
  }

  emit(eventName: GarageViewEventsName, data?: string, itemData?: ItemData, carItems?: NodeListOf<Element>) {
    return super.emit(eventName, data, itemData, carItems);
  }

  on(
    eventName: GarageViewEventsName,
    callback: (data: string, itemData: ItemData, carItems: NodeListOf<Element>) => void
  ) {
    return super.on(eventName, callback);
  }
}

export default GarageView;
