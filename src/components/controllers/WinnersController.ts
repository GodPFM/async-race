import type { AppModelInstance } from '../model/AppModel';
import { RouterInstance } from '../../utils/router';
import { WinnersViewInstance } from '../views/WinnersView';

export class WinnersController {
  private model: AppModelInstance;

  private router: RouterInstance;

  private view: WinnersViewInstance;

  constructor(model: AppModelInstance, view: WinnersViewInstance, router: RouterInstance) {
    this.model = model;
    this.view = view;
    this.router = router;
    this.view.on('CHANGE_WINNERS_TABLE', (page, data, isPagination) => {
      this.model.changeWinnersTable(page, data, isPagination);
    });
  }
}

export default WinnersController;
