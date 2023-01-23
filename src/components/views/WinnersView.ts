import EventEmitter from 'events';
import type { AppModelInstance } from '../model/AppModel';
import winnerTemplate from '../../templates/winners.html';
import rowTemplate from '../../templates/winnersTableRowTemplate.html';
import { CarParam, ItemData, WinnerParams } from '../../utils/types';
import modalWindowTemplate from '../../templates/modalWindow.html';

type WinnersViewEventsName = 'CHANGE_WINNERS_TABLE' | 'CHANGE_WINNERS_PAGE';

export type WinnersViewInstance = InstanceType<typeof WinnersView>;

export class WinnersView extends EventEmitter {
  private model: AppModelInstance;

  private lastSort: string;

  private page: number;

  constructor(model: AppModelInstance) {
    super();
    this.model = model;
    this.page = 1;
    this.lastSort = '';
    model.on('CHANGE_PAGE', async (page: string) => {
      if (page === '/winners') {
        const result = await this.model.getWinners(String(this.page));
        if (result) {
          this.build(result[1]);
          this.buildRows(result[0]);
        }
      }
    });
    model.on('WINNERS_READY', (data, itemData, carParams, isRaceAll, winnersData) => {
      if (winnersData.length) {
        this.removeTableRows();
        this.buildRows(winnersData);
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
          const modalWindow = document.createElement('div');
          modalWindow.className = 'modal-window hidden';
          modalWindow.innerHTML = modalWindowTemplate;
          mainWrapperTemplate.append(modalWindow);
          mainContainer.append(mainWrapperTemplate);
          mainWrapper = mainContainer.querySelector('.main__wrapper');
        }
        const winnerSection = document.createElement('section');
        winnerSection.className = 'winners';
        winnerSection.innerHTML = winnerTemplate;
        if (mainWrapper) {
          mainWrapper.append(winnerSection);
        }
        this.addClickListener();
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

  addClickListener() {
    const tableHead = document.querySelector('.winners__table-head');
    const pageField = document.querySelector('.winners__page-number');
    tableHead?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (pageField) {
        const page = Number(pageField.textContent);
        if (target.closest('.winners__table-best-time')) {
          this.lastSort = 'time';
          this.switchArrow('time');
          this.hideArrow('win');
          this.emit('CHANGE_WINNERS_TABLE', Number(page), 'time', false);
        }
        if (target.closest('.winners__table-wins')) {
          this.lastSort = 'wins';
          this.switchArrow('win');
          this.hideArrow('time');
          this.emit('CHANGE_WINNERS_TABLE', Number(page), 'wins', false);
        }
      }
    });
    document.querySelector('.winners__button--prev')?.addEventListener('click', () => {
      if (pageField) {
        const page = Number(pageField.textContent) - 1;
        if (page !== 0) {
          pageField.textContent = String(page);
          this.page = page;
          this.emit('CHANGE_WINNERS_TABLE', page, this.lastSort, true);
        }
      }
    });
    document.querySelector('.winners__button--next')?.addEventListener('click', () => {
      if (pageField) {
        const page = Number(pageField.textContent) + 1;
        const items = document.querySelectorAll('.winners__row').length;
        const totalCount = document.querySelector('.winners__count');
        let totalCountNumber = 0;
        if (totalCount) {
          totalCountNumber = Number(totalCount.textContent);
        }
        if (items === 10 && Math.ceil(totalCountNumber / 10) >= page) {
          pageField.textContent = String(page);
          this.page = page;
          this.emit('CHANGE_WINNERS_TABLE', page, this.lastSort, true);
        }
      }
    });
  }

  switchArrow(tableCellName: string) {
    const arrow = document.querySelector(`.winners__${tableCellName}-arrow`) as HTMLElement;
    if (arrow) {
      if (arrow.classList.contains('hidden')) {
        arrow.classList.remove('hidden');
      } else if (arrow.classList.contains('rotate')) {
        arrow.classList.remove('rotate');
      } else {
        arrow.classList.add('rotate');
      }
    }
  }

  hideArrow(tableCellName: string) {
    const arrow = document.querySelector(`.winners__${tableCellName}-arrow`);
    if (arrow) {
      if (!arrow.classList.contains('hidden')) {
        arrow.classList.add('hidden');
      }
      if (!arrow.classList.contains('rotate')) {
        arrow.classList.add('rotate');
      }
    }
  }

  removeTableRows() {
    document.querySelectorAll('.winners__row')?.forEach((el) => {
      el.remove();
    });
  }

  emit(eventName: WinnersViewEventsName, page: number, data: string, isPagination: boolean) {
    return super.emit(eventName, page, data, isPagination);
  }

  on(eventName: WinnersViewEventsName, callback: (page: number, data: string, isPagination: boolean) => void) {
    return super.on(eventName, callback);
  }
}
