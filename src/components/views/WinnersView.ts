import EventEmitter from 'events';
import type { AppModelInstance } from '../model/AppModel';

type WinnersViewEventsName = '';

export type WinnersViewInstance = InstanceType<typeof WinnersView>;

export class WinnersView extends EventEmitter {
  private model: AppModelInstance;

  constructor(model: AppModelInstance) {
    super();
    this.model = model;
  }

  build() {
    const container = document.querySelector('.main');
    if (container) {
      container.textContent = 'winners';
    }
  }

  emit(eventName: WinnersViewEventsName) {
    return super.emit(eventName);
  }

  on(eventName: WinnersViewEventsName, callback: (data: string) => void) {
    return super.on(eventName, callback);
  }
}
