import './styles/styles.css';

import { Router } from './utils/router';
import { AppModel } from './components/model/AppModel';
import { AppView } from './components/views/AppView';
import { GarageView } from './components/views/GarageView';
import { WinnersView } from './components/views/WinnersView';
import { AppController } from './components/controllers/AppController';
import { GarageController } from './components/controllers/GarageController';
import { WinnersController } from './components/controllers/WinnersController';

const router = new Router();
const model = new AppModel();

const appView = new AppView(model);
const mainContainer = appView.build();
const garageView = new GarageView(model);
const winnersView = new WinnersView(model);
const garageController = new GarageController(model, garageView, router);
const winnersController = new WinnersController(model, winnersView, router);
const appController = new AppController(model, appView, router);
