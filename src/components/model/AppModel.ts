import EventEmitter from 'events';

type AppModelEventsName = 'CHANGE_PAGE';
export type AppModelInstance = InstanceType<typeof AppModel>;

export class AppModel extends EventEmitter {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    super();
  }

  changePage(page: string) {
    this.emit('CHANGE_PAGE', page);
  }

  emit(eventName: AppModelEventsName, data: string) {
    return super.emit(eventName, data);
  }

  on(eventName: AppModelEventsName, callback: (data: string) => void) {
    return super.on(eventName, callback);
  }
}
