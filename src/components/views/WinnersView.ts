import EventEmitter from 'events';
import type { AppModelInstance } from '../model/AppModel';
import winnerTemplate from '../../templates/winners.html';
import rowTemplate from '../../templates/winnersTableRowTemplate.html';
import { CarParam, ItemData, WinnerParams } from '../../utils/types';

type WinnersViewEventsName = '';

export type WinnersViewInstance = InstanceType<typeof WinnersView>;

export class WinnersView extends EventEmitter {
  private model: AppModelInstance;

  constructor(model: AppModelInstance) {
    super();
    this.model = model;
    model.on('CHANGE_PAGE', async (page: string) => {
      if (page === '/winners') {
        const result = await this.model.getWinners('1', undefined, undefined);
        if (result) {
          this.build(result[1]);
          this.buildRows(result[0]);
        }
      }
    });
  }

  build(page: number) {
    const mainContainer = document.querySelector('.main') as HTMLElement;
    const winnerPage = document.querySelector('.winners') as HTMLElement;
    if (mainContainer) {
      const racePage = document.querySelector('.main__change-car') as HTMLElement;
      if (racePage) {
        racePage.hidden = true;
      }
      if (winnerPage) {
        winnerPage.hidden = false;
        const tableRowElements = document.querySelectorAll('.winners__row');
        tableRowElements?.forEach((el) => {
          el.remove();
        });
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
    const count = document.querySelector('.winners__count');
    if (count) {
      count.textContent = String(page);
    }
  }

  buildRows(arrayWithData: Awaited<WinnerParams & ItemData>[]) {
    const winnersTable = document.querySelector('.winners__table');
    if (arrayWithData && winnersTable) {
      arrayWithData.forEach((el, index) => {
        const fragment = document.createElement('div');
        fragment.innerHTML = rowTemplate;
        const number = fragment.querySelector('.winners__number');
        const color = fragment.querySelector('.winners__car-color');
        const name = fragment.querySelector('.winners__name');
        const wins = fragment.querySelector('.winners__wins');
        const bestTime = fragment.querySelector('.winners__best-time');
        if (number && color && name && wins && bestTime) {
          number.textContent = String(index + 1);
          color.setAttribute('fill', arrayWithData[index].color);
          name.textContent = arrayWithData[index].name;
          wins.textContent = String(arrayWithData[index].wins);
          bestTime.textContent = String(arrayWithData[index].time);
        }
        const row = fragment.querySelector('.winners__row');
        if (row) {
          winnersTable.append(row);
        }
      });
    }
  }

  emit(eventName: WinnersViewEventsName) {
    return super.emit(eventName);
  }

  on(eventName: WinnersViewEventsName, callback: (data: string) => void) {
    return super.on(eventName, callback);
  }
}
