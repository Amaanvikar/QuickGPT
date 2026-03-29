import express from 'express';
import cors from 'cors';
import { stripeWebhook } from './controllers/webhook.js';

const app = express();

app.post(
    '/api/webhook',
    express.raw({ type: 'application/json' }),
    stripeWebhook
);

const clientOrigins = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
    cors({
        origin: clientOrigins,
        credentials: true,
    })
);

app.use(express.json());



export default app;