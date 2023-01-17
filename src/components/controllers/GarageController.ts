import type { AppModelInstance } from '../model/AppModel';
import { RouterInstance } from '../../utils/router';
import { GarageViewInstance } from '../views/GarageView';

export class GarageController {
  private model: AppModelInstance;

  private router: RouterInstance;

  private view: GarageViewInstance;

  constructor(model: AppModelInstance, view: GarageViewInstance, router: RouterInstance) {
    this.model = model;
    this.view = view;
    this.router = router;
    model.on('CHANGE_PAGE', (page) => {
      console.log(page);
      if (page === '/') {
        this.view.build();
      }
    });
  }
}

export default GarageController;
