import "reflect-metadata";
import { Configurations } from './config';
import { Routes } from "./routes";
import express = require('express');
import { createConnection, getConnectionManager } from "typeorm";
import { Request, Response } from 'express';
import { getSummary, getContentType, signalIsUp, createMiddleware } from '@promster/express';
const port = Configurations.port;
const uri = `localhost:${port}`;

const appInitialSetup = {
  'environment': process.env.NODE_ENV,
  "port:": Configurations.port,
  hash: process.env.ShortHash
}
console.log(`App Initial Setup: ${JSON.stringify(appInitialSetup)}`);

const app = express();
app.use(express.urlencoded());
app.use(createMiddleware({ app }));
app.use(express.json());
app.use('/metrics', (req: Request, res: Response) => {
  req.statusCode = 200;
  res.setHeader('Content-Type', getContentType());
  res.end(getSummary());
});

app.listen(port, () => {
  console.log(`Server ready at ${uri}`);
  return getDbConnections().then(() => { Routes.call(app) });
});

async function getDbConnections() {
  let connections = [];
  // if (!getConnectionManager().has('default')) {
  //   await createConnection('default').then(() => console.log('created defaultDB connection'));
  // }
  return connections;
}
signalIsUp();