import {ServerApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export {ServerApplication};

const dotenv = require('dotenv');

export async function main(options: ApplicationConfig = {}) {
  dotenv.config();
  const app = new ServerApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
