import type { AppModelInstance } from '@/components/model/AppModel';
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
  }
}

export default AppController;
