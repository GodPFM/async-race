import EventEmitter from 'events';
import type { AppModelInstance } from '../model/AppModel';

type GarageViewEventsName = '';

export type GarageViewInstance = InstanceType<typeof GarageView>;

export class GarageView extends EventEmitter {
  private model: AppModelInstance;

  constructor(model: AppModelInstance) {
    super();
    this.model = model;
  }

  build() {
    const container = document.querySelector('.main');
    if (container) {
      container.textContent = 'garage';
    }
  }

  emit(eventName: string) {
    return super.emit(eventName);
  }

  on(eventName: string, callback: (data: string) => void) {
    return super.on(eventName, callback);
  }
}

export default GarageView;
