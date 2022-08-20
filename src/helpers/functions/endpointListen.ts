import { Client } from '@client';
import { errorHandler } from '@functions/errorHandler';
import express from 'express';
import bodyParser from 'body-parser';
import { success } from 'helpers/logger';
import { EndpointMessage } from '../interfaces/endpointListen';

async function errorPayloadHandler(client: Client, payload: EndpointMessage) {
  return errorHandler(client, payload.content, payload.type, client.tokens.endpointChannel);
}

export default function endpointListen(client: Client) {
  const app = express();
  const port = client.tokens.endpointPort;

  // parse application/json
  app.use(bodyParser.json());

  app.post('/', async (req, res) => {
    const payload = req.body as EndpointMessage;
    errorPayloadHandler(client, payload);
    res.status(200).end();
  });

  app.listen(port, 'localhost', () => {
    console.log(`${success}Endpoint listening on port ${port}.`);
  });
}
