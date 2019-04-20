import * as Express from 'express';
import * as path from 'path';

import * as httpConf from '../config/http.json';
import * as settings from '../config/settings.json';

import startController from './controller';

export const app = Express();

app.disable('x-powered-by');
app.disable('etag');
app.set('view engine', 'ejs');

startController('/api');

app.use('/public', Express.static(path.resolve('./public')));
app.get('/', (req, res, next) => {
  res.render('../view/index.ejs');
});

app.listen(httpConf.port, httpConf.ip, () => {
  console.log(`Started HTTP server at ${httpConf.ip}:${httpConf.port}`);
});


export { settings };
