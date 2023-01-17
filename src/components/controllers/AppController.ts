import type { AppModelInstance } from '../model/AppModel';
import { AppViewInstance } from '../views/AppView';
import { RouterInstance } from '../../utils/router';

export class AppController {
  private model: AppModelInstance;

  private view: AppViewInstance;

  private router: RouterInstance;

  constructor(model: AppModelInstance, view: AppViewInstance, router: RouterInstance) {
    this.model = model;
    this.view = view;
    this.router = router;
    router.on('ROUTE', (page: string) => {
      this.model.changePage(page);
    });
    this.view.on('GARAGE_CLICK', () => {
      this.router.push('/');
    });
    this.view.on('WINNERS_CLICK', () => {
      this.router.push('/winners');
    });
    router.init();
  }
}

export default AppController;
