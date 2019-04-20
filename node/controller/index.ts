import { app } from '../app';
import Get from './get';

export default (url: string = ''): void => {

  app.get(`${url}/get`, Get);
};
