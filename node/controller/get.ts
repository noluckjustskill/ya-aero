import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import fetch from 'node-fetch';

import { settings } from '../app';

interface IRequestBody {
  renew?: 'yes' | 'no';
}

const dir = path.resolve(__dirname + '/../cache');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir); // Create dir for cache
}

const dict = [];

fs.createReadStream(path.resolve(__dirname + '/../data/airports.csv'))
  .pipe(csv())
  .on('data', (data) => {
    try {
      dict.push(data);
    } catch (err) {
      console.log('fail to load airports data');
    }
  }).on('end', () => {
    console.log('Airports data loaded');
  });

export default async (req: IRequest<IRequestBody>, res: IResponse<any>) => {
  try {

    if (req.query.renew !== 'yes') {
      res.sendFile(`${dir}/data.json`);
    } else {
      const result = [].concat(await fetch(settings.urlTable.replace(/%key%/, settings.key).replace(/%code%/, settings.iataCode).replace(/%type%/, 'arrival')).then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(response.statusText);
        }
      }), await fetch(settings.urlTable.replace(/%key%/, settings.key).replace(/%code%/, settings.iataCode).replace(/%type%/, 'departure')).then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(response.statusText);
        }
      }));

      const airPorts = {},
            cities = {};

      // Cuz will be promises in loop
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < result.length; i++) {
        const flight = result[i];

        const aAirport = flight.arrival.iataCode,
              dAirpot = flight.departure.iataCode;

        if (!airPorts[aAirport]) {
          const airport = dict.find((a) => a.iata === aAirport);

          if (airport) {
            airPorts[aAirport] = airport.airpot;
            cities[aAirport] = `${airport.city}, ${airport.contry}`;
          }
        }

        if (!airPorts[dAirpot]) {
          const airport = dict.find((a) => a.iata === dAirpot);

          if (airport) {
            airPorts[dAirpot] = airport.airpot;
            cities[dAirpot] = `${airport.city}, ${airport.contry}`;
          }
        }
      }

      const data = {airPorts, cities, result};

      fs.writeFileSync(`${dir}/data.json`, JSON.stringify(data));

      res.send(data);
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
};
