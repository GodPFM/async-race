import EventEmitter from 'events';
import type { AppModelInstance } from '../model/AppModel';
import footer from '../../templates/footer.html';
import header from '../../templates/header.html';

type AppViewEventsName = 'GARAGE_CLICK' | 'WINNERS_CLICK';

export type AppViewInstance = InstanceType<typeof AppView>;

export class AppView extends EventEmitter {
  private model: AppModelInstance;

  private mainContainer: HTMLElement;

  constructor(model: AppModelInstance) {
    super();
    this.mainContainer = document.createElement('main');
    this.mainContainer.className = 'main';
    this.model = model;
  }

  build() {
    const fragment = document.createElement('template');
    const headerFragment = document.createElement('template');
    const footerFragment = document.createElement('template');
    headerFragment.innerHTML = header;
    footerFragment.innerHTML = footer;
    fragment.content.append(headerFragment.content);
    fragment.content.append(this.mainContainer);
    fragment.content.append(footerFragment.content);
    document.body.append(fragment.content);
    this.addListenerToHeaderBtns();
    return this.mainContainer;
  }

  addListenerToHeaderBtns() {
    const btns = document.querySelectorAll('.header__btn');
    if (btns) {
      btns.forEach((el) => {
        const element = el as HTMLElement;
        element.addEventListener('click', () => {
          switch (element.dataset.to) {
            case 'garage':
              this.emit('GARAGE_CLICK');
              break;
            case 'winners':
              this.emit('WINNERS_CLICK');
              break;
            default:
              break;
          }
        });
      });
    }
  }

  emit(eventName: AppViewEventsName) {
    return super.emit(eventName);
  }

  on(eventName: AppViewEventsName, callback: (data: string) => void) {
    return super.on(eventName, callback);
  }
}
