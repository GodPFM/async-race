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
    model.on('CAR_UPDATED', (data, itemData) => {
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
  }
}

export default GarageController;
