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
    model.on('CHANGE_PAGE', (page: string) => {
      if (page === '/winners') this.view.build();
    });
  }
}

export default WinnersController;
