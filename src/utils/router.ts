import { createBrowserHistory } from 'history';
import type { Location, Search } from 'history';
import EventEmitter from 'events';

const history = createBrowserHistory();

type RouterEventsName = 'ROUTE';
export type RouterInstance = InstanceType<typeof Router>;

const paths = ['/', '/winners'];

export class Router extends EventEmitter {
  public pathParts: Array<string> = [];

  constructor() {
    super();
    history.listen(({ location, action }) => {
      if (action !== 'REPLACE') this.processRoutes(location);
    });
  }

  init() {
    this.processRoutes(history.location);
  }

  emit(event: RouterEventsName, page: string, arg?: { path: string; search?: Search }) {
    return super.emit(event, page, arg);
  }

  push(path: string) {
    history.push(path);
  }

  processRoutes(location: Location) {
    this.pathParts = Array.from(location.pathname.match(/\/[a-z0-9]+/gi) || ['/']);
    if (paths.includes(this.pathParts[0]) && this.pathParts.length <= 2) {
      this.emit('ROUTE', this.pathParts[0] as string, {
        path: this.pathParts[1],
        search: decodeURI(location.search),
      });
    } else this.push('/404');
  }

  setQueries(search: string) {
    history.replace({ search });
  }
}
