import express from 'express';
import { createCafeApiRouter } from '../server/api';
import { createMongoApiRouter } from '../server/mongodb';

const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Mount cafe and mongo routers
app.use('/api', createCafeApiRouter());
app.use('/api/mongo', createMongoApiRouter());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverless: true, time: new Date().toISOString() });
});

export default app;
