import EventEmitter from 'events';
import type { AppModelInstance } from '../model/AppModel';
import winnerTemplate from '../../templates/winners.html';

type WinnersViewEventsName = '';

export type WinnersViewInstance = InstanceType<typeof WinnersView>;

export class WinnersView extends EventEmitter {
  private model: AppModelInstance;

  constructor(model: AppModelInstance) {
    super();
    this.model = model;
    model.on('CHANGE_PAGE', (page: string) => {
      if (page === '/winners') this.build();
    });
  }

  build() {
    const mainContainer = document.querySelector('.main') as HTMLElement;
    const winnerPage = document.querySelector('.winners') as HTMLElement;
    if (mainContainer) {
      const racePage = document.querySelector('.main__change-car') as HTMLElement;
      if (racePage) {
        racePage.hidden = true;
      }
      if (winnerPage) {
        winnerPage.hidden = false;
      } else {
        let mainWrapper = mainContainer.querySelector('.main__wrapper');
        if (!mainWrapper) {
          const mainWrapperTemplate = document.createElement('div');
          mainWrapperTemplate.className = 'main__wrapper wrapper';
          mainContainer.append(mainWrapperTemplate);
          mainWrapper = mainContainer.querySelector('.main__wrapper');
        }
        const winnerSection = document.createElement('section');
        winnerSection.className = 'winners';
        winnerSection.innerHTML = winnerTemplate;
        if (mainWrapper) {
          mainWrapper.append(winnerSection);
        }
      }
    }
    const garageContainer = document.querySelector('test');
  }

  emit(eventName: WinnersViewEventsName) {
    return super.emit(eventName);
  }

  on(eventName: WinnersViewEventsName, callback: (data: string) => void) {
    return super.on(eventName, callback);
  }
}
