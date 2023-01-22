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
        await this.model.getItems(Number(data));
      }
    });
    this.view.on('START_ENGINE', async (data) => {
      await this.model.startCarEngine(data, false);
    });
    this.view.on('CAR_RESET', async (data) => {
      await this.model.resetCar(data, false);
    });
    this.view.on('SWITCH_DRIVE_MODE', async (data) => {
      const result = await this.model.startCarRace(data);
      if (result) {
        this.view.carDrive(data, true, false);
      }
      if (result === null) {
        this.view.carDrive(data, false, false);
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
      this.view.showModalWindow('loading');
      const arrayWithPromises = arrayWithIdToReset.map((item) => this.model.resetCar(item, true));
      await Promise.all(arrayWithPromises);
      this.view.showModalWindow('loading');
    });
    this.view.on('CAR_START_ALL', async (data, itemData, carItems) => {
      const arrayWithIdToReady: Array<string> = [];
      this.view.showModalWindow('loading');
      carItems?.forEach((el) => {
        const element = el as HTMLElement;
        if (element.dataset.id) {
          arrayWithIdToReady.push(element.dataset.id);
        }
      });
      const carsToReset = arrayWithIdToReady.map((item) => this.model.resetCar(item, true));
      await Promise.all(carsToReset);
      const result = arrayWithIdToReady.map((item) => this.model.startCarEngine(item, true));
      await Promise.all(result);
      const startRacePromiseArray = arrayWithIdToReady.map((item) => this.model.startCarRace(item));
      await Promise.all(startRacePromiseArray).then((value) => {
        this.view.showModalWindow('loading');
        value.forEach((el, index) => {
          if (el) {
            this.view.carDrive(arrayWithIdToReady[index], true, true);
          }
          if (el === null) {
            this.view.carDrive(arrayWithIdToReady[index], false, true);
          }
        });
      });
    });
    this.view.on('WINNER_FOUND', (id, itemData) => {
      if (!this.model.isWinnerInRace) {
        this.model.isWinnerInRace = true;
        const result = this.model.addWinner(id, itemData.time);
        this.view.showModalWindow('winner', itemData);
      }
    });
  }
}

export default GarageController;
