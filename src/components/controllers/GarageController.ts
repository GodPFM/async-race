import type { AppModelInstance } from '../model/AppModel';
import { RouterInstance } from '../../utils/router';
import { GarageViewInstance } from '../views/GarageView';
import { getCars } from '../../utils/loader';

export class GarageController {
  private model: AppModelInstance;

  private router: RouterInstance;

  private view: GarageViewInstance;

  constructor(model: AppModelInstance, view: GarageViewInstance, router: RouterInstance) {
    this.model = model;
    this.view = view;
    this.router = router;
    model.on('CHANGE_PAGE', async (page) => {
      if (page === '/') {
        const cars = await getCars(1, 7);
        if (cars) {
          this.view.build(cars[0], cars[1]);
        }
      }
    });
    model.on('CAR_ADDED', (data, itemData) => {
      if (itemData) {
        this.view.addCarInPage(itemData);
      }
    });
    model.on('CAR_DELETED', (data) => {
      this.view.deleteCarFromPage(data);
    });
    model.on('CAR_UPDATED', (data, itemData, carParams) => {
      this.view.updateCar(itemData);
    });
    this.view.on('CREATE_BTN_CLICK', () => {
      const name = (document.querySelector('.main__create-car-name') as HTMLInputElement).value;
      const color = (document.querySelector('.main__create-car-color') as HTMLInputElement).value;
      if (name && color) {
        this.model.addCar(name, color);
      }
    });
    this.view.on('DELETE_CAR', (data) => {
      this.model.removeCar(data);
    });
    this.view.on('UPDATE_CAR', (data, itemData) => {
      this.model.updateCar(itemData);
    });
    this.view.on('GENERATE_CARS', () => {
      this.model.generateOneHundredCars();
    });
    this.view.on('CHANGE_GARAGE_PAGE', async (data) => {
      if (Number(data) !== 0) {
        const carsFromServer = await this.model.getItems(Number(data));
        if (carsFromServer) {
          const result = await this.model.getItems(Number(data));
          if (result) {
            if (result[0].length) {
              this.view.changePage(result[1]);
              this.view.buildCars(result[0]);
            }
          }
        }
      }
    });
    this.view.on('START_ENGINE', async (data) => {
      const result = await this.model.startCarEngine(data);
      if (result) {
        this.view.prepareCar(data, result, false);
      }
    });
    this.view.on('CAR_RESET', async (data) => {
      const result = await this.model.resetCar(data, false);
      if (result) {
        this.view.resetCar(data);
      }
    });
    this.view.on('SWITCH_DRIVE_MODE', async (data) => {
      const result = await this.model.startCarRace(data);
      if (result) {
        this.view.carDrive(data, true);
      }
      if (result === null) {
        this.view.carDrive(data, false);
      }
    });
    this.view.on('CAR_RESET_ALL', async (data, itemData, carItems) => {
      const arrayWithIdToReset: Array<string> = [];
      carItems?.forEach((el) => {
        const element = el as HTMLElement;
        if (element.dataset.id) {
          arrayWithIdToReset.push(element.dataset.id);
        }
      });
      const arrayWithPromises = arrayWithIdToReset.map((item) => this.model.resetCar(item, true));
      await Promise.all(arrayWithPromises).then((value) => {
        arrayWithIdToReset.forEach((el) => {
          this.view.resetCar(el);
        });
      });
    });
    this.view.on('CAR_START_ALL', async (data, itemData, carItems) => {
      const arrayWithIdToReady: Array<string> = [];
      console.log(carItems);
      carItems?.forEach((el) => {
        const element = el as HTMLElement;
        if (element.dataset.id) {
          arrayWithIdToReady.push(element.dataset.id);
        }
      });
      const result = arrayWithIdToReady.map((item) => this.model.startCarEngine(item));
      await Promise.all(result).then((value) => {
        value.forEach((el, index) => {
          if (el) {
            this.view.prepareCar(arrayWithIdToReady[index], el, true);
          }
        });
      });
      const startRacePromiseArray = arrayWithIdToReady.map((item) => this.model.startCarRace(item));
      await Promise.all(startRacePromiseArray).then((value) => {
        value.forEach((el, index) => {
          if (el) {
            this.view.carDrive(arrayWithIdToReady[index], true);
          }
          if (el === null) {
            this.view.carDrive(arrayWithIdToReady[index], false);
          }
        });
      });
    });
  }
}

export default GarageController;
