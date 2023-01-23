import EventEmitter from 'events';
import type { AppModelInstance } from '../model/AppModel';
import garage from '../../templates/garage.html';
import car from '../../templates/car.html';
import errorServer from '../../templates/errorServer.html';
import modalWindowTemplate from '../../templates/modalWindow.html';
import { CarParam, ItemData } from '../../utils/types';
import { getCars } from '../../utils/loader';

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

  private isRaceReset: boolean;

  private idToReset: { [key: number]: string };

  constructor(model: AppModelInstance) {
    super();
    this.model = model;
    this.animationCarData = {} as AnimationCarData;
    this.isRaceReset = false;
    this.idToReset = { 0: '0' };
    model.on('CHANGE_PAGE', async (page) => {
      if (page === '/') {
        const cars = await getCars(1, 7);
        if (cars) {
          this.build(cars[0], cars[1]);
        } else {
          this.build();
        }
      }
    });
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
      if (isRaceAll !== undefined) {
        this.prepareCar(data, carParams, isRaceAll);
        if (!isRaceAll) {
          this.carDrive(data, true, false);
        }
      }
    });
    model.on('CAR_BROKEN', (data) => {
      if (data) {
        this.crashCar(data);
      }
    });
  }

  build(cars?: [ItemData], totalCount?: number) {
    const container = document.querySelector('.main');
    const garageSection = document.querySelector('.main__change-car') as HTMLElement;
    const winnersSection = document.querySelector('.winners') as HTMLElement;
    if (container) {
      const errorElement = container.querySelector('.main__error-server');
      if (errorElement) {
        errorElement.remove();
      }
      if (cars && totalCount) {
        const mainWrapper = document.querySelector('.main__wrapper');
        if (mainWrapper) {
          if (garageSection) {
            garageSection.hidden = false;
          } else {
            const fragment = document.createElement('template');
            const garageTemplate = document.createElement('template');
            garageTemplate.innerHTML = garage;
            const modalWindow = document.createElement('div');
            modalWindow.className = 'modal-window hidden';
            modalWindow.innerHTML = modalWindowTemplate;
            fragment.content.append(modalWindow);
            fragment.content.append(garageTemplate.content);
            mainWrapper.append(fragment.content);
          }
          if (winnersSection) {
            winnersSection.hidden = true;
          }
        } else {
          const mainWrapperTemplate = document.createElement('div');
          const modalWindow = document.createElement('div');
          mainWrapperTemplate.className = 'main__wrapper wrapper';
          mainWrapperTemplate.innerHTML = garage;
          modalWindow.className = 'modal-window hidden';
          modalWindow.innerHTML = modalWindowTemplate;
          mainWrapperTemplate.append(modalWindow);
          container.append(mainWrapperTemplate);
        }
      } else {
        container.innerHTML = errorServer;
      }
    }
    if (cars && totalCount && !garageSection) {
      this.buildCars(cars);
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
        const totalCountField = document.querySelector('.main__garage-count-number');
        if (totalCountField) {
          const totalNumber = Number(totalCountField.textContent);
          if (Math.ceil(totalNumber / 7) >= Number(number) + 1) {
            this.emit('CHANGE_GARAGE_PAGE', String(Number(number) + 1));
          }
        }
      });
      document.querySelector('.main__race-reset')?.addEventListener('click', () => {
        const carItems = document.querySelectorAll('.main__race-car');
        if (carItems) {
          this.switchStateButtons(false);
          this.isRaceReset = true;
          this.emit('CAR_RESET_ALL', undefined, undefined, carItems);
        }
      });
      document.querySelector('.main__race-start')?.addEventListener('click', () => {
        const carItems = document.querySelectorAll('.main__race-car');
        if (carItems) {
          this.switchStateButtons(true);
          this.isRaceReset = false;
          this.emit('CAR_START_ALL', undefined, undefined, carItems);
        }
      });
      const updateButton = document.querySelector('.main__update-car-submit') as HTMLElement;
      updateButton?.addEventListener('click', () => {
        const newName = (document.querySelector('.main__update-car-name') as HTMLInputElement).value;
        const newColor = (document.querySelector('.main__update-car-color') as HTMLInputElement).value;
        const id = Number(updateButton.dataset.id);
        const item = document.querySelector(`.main__race-car[data-id="${id}"]`);
        if (newName && newColor && id && item) {
          this.emit('UPDATE_CAR', undefined, { name: newName, color: newColor, id });
        } else {
          this.resetInputfields('update');
        }
      });
    }
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
      if ((target as HTMLElement).closest('.main__car-start')) {
        const button = el.querySelector('.main__car-start') as HTMLButtonElement;
        if (button) {
          if (!button.disabled) {
            this.emit('START_ENGINE', id);
          }
          button.disabled = true;
        }
      }
      if ((target as HTMLElement).closest('.main__car-stop')) {
        const button = el.querySelector('.main__car-stop') as HTMLButtonElement;
        if (button) {
          if (!button.disabled) {
            if (id) {
              const idToAdd = Number(id);
              this.idToReset[idToAdd] = id;
            }
            this.emit('CAR_RESET', id);
          }
          button.disabled = true;
        }
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
    const item = document.querySelector(`.main__race-car[data-id="${id}"`) as HTMLElement;
    if (item) {
      item.dataset.velocity = String(carParams.velocity);
      item.dataset.distance = String(carParams.distance);
      const startButton = item.querySelector('.main__car-start') as HTMLButtonElement;
      if (startButton) {
        startButton.disabled = true;
      }
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
      if (carContainer) {
        let start: number | null = null;
        const singleCarAnimation = (time: DOMHighResTimeStamp) => {
          if (!start) start = time;
          const progress = time - start;
          const leftNewValue = (progress * velocity) / (distance / 100);
          if (leftNewValue >= 90) {
            if (isRace && !this.isRaceReset && !this.idToReset[Number(id)]) {
              if (!name) {
                name = '';
              }
              this.switchStateButtons(false);
              this.emit('WINNER_FOUND', id, { name, color: '', id: Number(id), time: progress });
            }
          }
          carContainer.style.left = String(`${leftNewValue}%`);
          if (leftNewValue < 100) {
            this.animationCarData[id] = requestAnimationFrame(singleCarAnimation);
          }
        };
        this.animationCarData[id] = window.requestAnimationFrame(singleCarAnimation);
      }
    }
  }

  crashCar(id: string) {
    const carRequestId = this.animationCarData[id];
    window.cancelAnimationFrame(carRequestId);
    const item = document.querySelector(`.main__race-car[data-id="${id}"`) as HTMLElement;
    if (item) {
      const carFireImage = item.querySelector('.main__car-fire') as HTMLElement;
      const carIcon = item.querySelector('.main__car-images') as HTMLElement;
      const trackElement = document.querySelector('.main__car-track');
      if (carFireImage && carIcon && trackElement) {
        const carIconStyles = getComputedStyle(carIcon);
        const carIconLeft = carIconStyles.getPropertyValue('left');
        const trackWidth = getComputedStyle(trackElement).width;
        const leftInPercent = (parseInt(carIconLeft, 10) / parseInt(trackWidth, 10)) * 100;
        if (carFireImage && leftInPercent < 100) {
          carFireImage.hidden = false;
        }
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

  switchStateButtons(isDisable: boolean) {
    const createButton = document.querySelector('.main__create-car-submit') as HTMLButtonElement;
    const updateButton = document.querySelector('.main__update-car-submit') as HTMLButtonElement;
    const toWinnersButton = document.querySelector('.header__garage-winners') as HTMLButtonElement;
    const prevButton = document.querySelector('.main__pagination-btn--prev') as HTMLButtonElement;
    const nextButton = document.querySelector('.main__pagination-btn--next') as HTMLButtonElement;
    const raceButton = document.querySelector('.main__race-start') as HTMLButtonElement;
    const generateCarsButton = document.querySelector('.main__race-generate') as HTMLButtonElement;
    document.querySelectorAll('.main__car-remove-btn')?.forEach((el) => {
      const element = el as HTMLButtonElement;
      element.disabled = isDisable;
    });
    if (
      createButton &&
      updateButton &&
      toWinnersButton &&
      prevButton &&
      nextButton &&
      raceButton &&
      generateCarsButton
    ) {
      createButton.disabled = isDisable;
      updateButton.disabled = isDisable;
      toWinnersButton.disabled = isDisable;
      prevButton.disabled = isDisable;
      nextButton.disabled = isDisable;
      raceButton.disabled = isDisable;
      generateCarsButton.disabled = isDisable;
    }
  }

  resetCar(id: string) {
    const carRequestId = this.animationCarData[id];
    window.cancelAnimationFrame(carRequestId);
    delete this.idToReset[Number(id)];
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
